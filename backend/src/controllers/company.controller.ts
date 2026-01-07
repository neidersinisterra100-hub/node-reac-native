import { RequestHandler } from "express";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ... existing code ... */

export const createCompany: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    if (authReq.user.role.toLowerCase() !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear empresas",
      });
    }

    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "El nombre de la empresa es obligatorio",
      });
    }

    const company = await CompanyModel.create({
      name: name.trim(),
      owner: authReq.user.id,
      balance: 0,
    });

    return res.status(201).json(company);
  } catch (error) {
    console.error("❌ Error createCompany:", error);
    return res.status(500).json({
      message: "Error al crear la empresa",
    });
  }
};

export const getMyCompanies: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userRole = authReq.user.role.toLowerCase();

    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({
        message: "No tienes permisos para ver esta información",
      });
    }

    let query = {};
    
    if (userRole === "owner") {
      query = { owner: authReq.user.id };
    }

    const companies = await CompanyModel.find(query).sort({ createdAt: -1 });

    return res.json(companies);
  } catch (error) {
    console.error("❌ Error getMyCompanies:", error);
    return res.status(500).json({
      message: "Error al obtener empresas",
    });
  }
};

export const toggleCompanyActive: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const userRole = authReq.user.role.toLowerCase();

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No autorizado para modificar esta empresa",
      });
    }

    company.active = !company.active;
    await company.save();

    return res.json(company);
  } catch (error) {
    console.error("❌ Error toggleCompanyActive:", error);
    return res.status(500).json({
      message: "Error al cambiar estado de la empresa",
    });
  }
};

/* ================= DELETE COMPANY (OWNER ONLY) ================= */
export const deleteCompany: RequestHandler = async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const { companyId } = req.params;
  
      if (!authReq.user) {
        return res.status(401).json({ message: "No autenticado" });
      }
  
      const company = await CompanyModel.findById(companyId);
  
      if (!company) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }
  
      if (company.owner.toString() !== authReq.user.id) {
        return res.status(403).json({
          message: "No autorizado para eliminar esta empresa",
        });
      }
  
      await CompanyModel.findByIdAndDelete(companyId);
  
      res.json({ message: "Empresa eliminada correctamente" });
    } catch (error) {
      console.error("❌ Error deleteCompany:", error);
      res.status(500).json({
        message: "Error al eliminar empresa",
      });
    }
  };
