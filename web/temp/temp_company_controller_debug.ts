import { RequestHandler } from "express";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= CREATE COMPANY (OWNER ONLY) ================= */

export const createCompany: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* 🔒 ROLE → SOLO OWNER (normalizado) */
    if (authReq.user.role.toLowerCase() !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear empresas",
      });
    }

    const { name } = req.body;

    /* 🔒 VALIDACIÓN */
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "El nombre de la empresa es obligatorio",
      });
    }

    /* ================= CREATE ================= */

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

/* ================= GET MY COMPANIES (OWNER & ADMIN) ================= */

export const getMyCompanies: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userRole = authReq.user.role.toLowerCase();

    /* 🔒 ROLE → OWNER O ADMIN */
    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({
        message: "No tienes permisos para ver esta información",
      });
    }

    /* ================= QUERY ================= */

    let query = {};
    
    // Si es owner, solo ve las suyas.
    // Si es admin, ve todas (query vacío).
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

/* ================= TOGGLE COMPANY ACTIVE (OWNER & ADMIN) ================= */

export const toggleCompanyActive: RequestHandler = async (req, res) => {
  try {
    console.log("👉 PATCH toggleCompanyActive llamado"); // LOG 1
    const authReq = req as AuthRequest;
    const { companyId } = req.params;
    console.log("👉 companyId recibido:", companyId); // LOG 2

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      console.log("👉 Empresa no encontrada en DB"); // LOG 3
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const userRole = authReq.user.role.toLowerCase();

    // Permitir si es Admin O si es el Owner de la empresa
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
