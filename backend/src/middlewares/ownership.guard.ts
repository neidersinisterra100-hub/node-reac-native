import { Request, Response, NextFunction } from "express";
import { CompanyModel } from "../models/company.model.js";
import { Types } from "mongoose";


/**
 * ownershipGuard
 *
 * Middleware de autorización por empresa.
 *
 * Este middleware NO autentica (eso lo hace requireAuth),
 * aquí solo se valida:
 * - rol
 * - empresa objetivo
 * - permisos sobre esa empresa
 *
 * Reglas:
 * - role "user"        ❌ nunca pasa
 * - role "admin"       ✅ solo si pertenece a la empresa
 * - role "owner"       ✅ si es dueño de la empresa
 * - role "super_owner" ✅ bypass total
 */
export const ownershipGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /* =========================
       1. AUTENTICACIÓN BÁSICA
       ========================= */
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* =========================
       2. SUPER OWNER (BYPASS)
       =========================
       - Puede operar sobre cualquier empresa
       - Aún validamos que la empresa exista
    */
    if (req.user.role === "super_owner") {
      const companyId =
        req.params.companyId ?? req.user.companyId;

      if (!companyId) {
        return res.status(400).json({
          message: "Empresa requerida",
        });
      }

      const company = await CompanyModel.findById(companyId);

      if (!company) {
        return res.status(404).json({
          message: "Empresa no encontrada",
        });
      }

      req.company = company;
      return next();
    }

    /* =========================
       3. BLOQUEO EXPLÍCITO USER
       =========================
       Usuarios finales NO acceden a:
       - /manage
       - /company
       - mutaciones
    */
    if (req.user.role === "user") {
      return res.status(403).json({
        message: "No tienes permisos para esta acción",
      });
    }

    /* =========================
       4. DETERMINAR EMPRESA
       =========================
       Prioridad:
       1. Param (:companyId)
       2. JWT (empresa activa)
    */
    const companyId =
      req.params.companyId ?? req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "Empresa no definida para esta operación",
      });
    }

    /* =========================
       5. BUSCAR EMPRESA
       ========================= */
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    /* =========================
       6. VALIDAR OWNERSHIP
       ========================= */
    const isOwner =
      company.owner.toString() === req.user!.id;

    const isAdmin =
      company.admins.some(
        (adminId: Types.ObjectId) =>
          adminId.toString() === req.user!.id
      );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permisos sobre esta empresa",
      });
    }


    // const isOwner =
    //   company.owner.toString() === req.user.id;

    // const isAdmin =
    //   req.user.role === "admin" &&
    //   req.user.companyId === company._id.toString();

    // if (!isOwner && !isAdmin) {
    //   return res.status(403).json({
    //     message: "No tienes permisos sobre esta empresa",
    //   });
    // }

    /* =========================
       7. INYECTAR CONTEXTO
       ========================= */
    req.company = company;

    next();
  } catch (error) {
    console.error("❌ ownershipGuard error:", error);
    return res.status(500).json({
      message: "Error validando permisos de empresa",
    });
  }
};
