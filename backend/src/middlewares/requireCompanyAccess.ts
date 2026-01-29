import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { CompanyModel } from "../models/company.model.js";

/* =========================================================
   REQUIRE COMPANY ACCESS
   ---------------------------------------------------------
   Valida que el usuario autenticado tenga acceso REAL
   a una empresa específica.
   
   ⚠️ IMPORTANTE:
   - Este middleware NO autentica
   - Requiere que `requireAuth` haya corrido antes
   - Usa `req.user` (tipado global en Express)
   ========================================================= */

export const requireCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* =====================================================
     SEGURIDAD BASE
     ===================================================== */
  if (!req.user) {
    return res.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  const { id: userId, role, companyId: tokenCompanyId } = req.user;

  /* =====================================================
     DETERMINAR COMPANY ID OBJETIVO
     -----------------------------------------------------
     Puede venir desde:
     - params (/:companyId)
     - body (casos puntuales)
     - token (admin)
     ===================================================== */
  const targetCompanyId =
    req.params.companyId || req.body.companyId || tokenCompanyId;

  if (!targetCompanyId) {
    return res.status(400).json({
      message: "CompanyId requerido",
    });
  }

  /* =====================================================
     BUSCAR EMPRESA
     ===================================================== */
  const company = await CompanyModel.findById(targetCompanyId);
  if (!company) {
    return res.status(404).json({
      message: "Empresa no encontrada",
    });
  }

  /* =====================================================
     VALIDAR OWNER
     ===================================================== */
  if (role === "owner") {
    if (company.owner.toString() !== userId) {
      return res.status(403).json({
        message: "No eres dueño de esta empresa",
      });
    }
  }

  /* =====================================================
     VALIDAR ADMIN
     ===================================================== */
  if (role === "admin") {
    const isAdmin = company.admins.some(
      (adminId: Types.ObjectId) =>
        adminId.toString() === userId
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "No perteneces a esta empresa",
      });
    }
  }

  /* =====================================================
     TODO OK → CONTINUAR
     ===================================================== */
  next();
};
