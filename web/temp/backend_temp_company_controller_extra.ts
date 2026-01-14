import { RequestHandler } from "express";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ... (createCompany y getMyCompanies ya los tienes actualizados) ... */

/* ================= TOGGLE COMPANY ACTIVE (OWNER & ADMIN) ================= */

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
