import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "./requireAuth.js";
import { CompanyModel } from "../models/company.model.js";

/* =========================================================
   REQUIRE COMPANY ACCESS
   ========================================================= */
// /**
//  * requireCompanyAccess
//  *
//  * Valida que el usuario autenticado tenga
//  * acceso REAL a una empresa específica.
//  *
//  * Reglas:
//  * - owner → debe ser dueño de la empresa
//  * - admin → debe pertenecer a la empresa
//  *
//  * Requiere:
//  * - requireAuth (antes)
//  * - requireOwnerOrAdmin (antes)
//  *
//  * ❌ No valida rol (eso ya se hizo)
//  * ❌ No valida autenticación
//  */

export const requireCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  const { id: userId, role } = authReq.user;

  /**
//    * El companyId puede venir:
//    * - en la URL (/:companyId)
//    * - en el body
//    * - en el token (admin)
//    *
//    * Ajusta esto según tu API.
//    */

  const targetCompanyId =
    req.params.companyId || req.body.companyId || authReq.user.companyId;

  if (!targetCompanyId) {
    return res.status(400).json({ message: "CompanyId requerido" });
  }

  /* =========================
     BUSCAR EMPRESA
     ========================= */

  const company = await CompanyModel.findById(targetCompanyId);
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }

  /* =========================
     VALIDAR OWNER
     ========================= */

  if (role === "owner") {
    if (company.owner.toString() !== userId) {
      return res.status(403).json({
        message: "No eres dueño de esta empresa",
      });
    }
  }

  /* =========================
     VALIDAR ADMIN (CORREGIDO)
     ========================= */

  if (role === "admin") {
    // 👇 admins está tipado como Types.ObjectId[]
    const isAdmin = company.admins.some(
      (adminId: Types.ObjectId) => adminId.toString() === userId
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "No perteneces a esta empresa",
      });
    }
  }

  next();
};



// import { Request, Response, NextFunction } from "express";
// import { AuthRequest } from "./requireAuth.js";
// import { CompanyModel } from "../models/company.model.js";

// /* =========================================================
//    MIDDLEWARE: REQUIRE COMPANY ACCESS
//    ========================================================= */

// /**
//  * requireCompanyAccess
//  *
//  * Valida que el usuario autenticado tenga
//  * acceso REAL a una empresa específica.
//  *
//  * Reglas:
//  * - owner → debe ser dueño de la empresa
//  * - admin → debe pertenecer a la empresa
//  *
//  * Requiere:
//  * - requireAuth (antes)
//  * - requireOwnerOrAdmin (antes)
//  *
//  * ❌ No valida rol (eso ya se hizo)
//  * ❌ No valida autenticación
//  */
// export const requireCompanyAccess = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authReq = req as AuthRequest;

//   /* =========================
//      1. VALIDAR CONTEXTO
//      ========================= */

//   if (!authReq.user) {
//     return res.status(401).json({
//       message: "Usuario no autenticado",
//     });
//   }

//   const { role, id: userId, companyId } = authReq.user;

//   /* =========================
//      2. OBTENER COMPANY ID
//      ========================= */

//   /**
//    * El companyId puede venir:
//    * - en la URL (/:companyId)
//    * - en el body
//    * - en el token (admin)
//    *
//    * Ajusta esto según tu API.
//    */
//   const targetCompanyId =
//     req.params.companyId || req.body.companyId || companyId;

//   if (!targetCompanyId) {
//     return res.status(400).json({
//       message: "CompanyId requerido",
//     });
//   }

//   /* =========================
//      3. BUSCAR EMPRESA
//      ========================= */

//   const company = await CompanyModel.findById(targetCompanyId);
//   if (!company) {
//     return res.status(404).json({
//       message: "Empresa no encontrada",
//     });
//   }

//   /* =========================
//      4. VALIDAR ACCESO
//      ========================= */

//   // OWNER → debe ser dueño real
//   if (role === "owner") {
//     if (company.owner.toString() !== userId) {
//       return res.status(403).json({
//         message: "No eres dueño de esta empresa",
//       });
//     }
//   }

//   // ADMIN → debe pertenecer a la empresa
//   if (role === "admin") {
//     const isAdmin = company.admins
//       .map((id) => id.toString())
//       .includes(userId);

//     if (!isAdmin) {
//       return res.status(403).json({
//         message: "No perteneces a esta empresa",
//       });
//     }
//   }

//   /* =========================
//      5. CONTINUAR
//      ========================= */

//   next();
// };
