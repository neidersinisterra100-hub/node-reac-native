import { Request, Response, NextFunction } from "express";
import { CompanyModel } from "../models/company.model.js";

export const ownershipGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 🔐 requireAuth ya se ejecutó
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // 📌 Empresa objetivo:
    // 1. param (/:companyId)
    // 2. JWT (empresa activa del usuario)
    const companyId =
      req.params.companyId ?? req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "Empresa no definida para esta operación",
      });
    }

    // 🔍 Buscar empresa
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    // 🧠 Ownership:
    // - owner: siempre
    // - admin: solo si pertenece a la empresa
    const isOwner = company.owner.toString() === req.user.id;
    const isAdmin =
      req.user.role === "admin" &&
      req.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permisos sobre esta empresa",
      });
    }

    // ✅ Inyectar empresa
    req.company = company;

    next();
  } catch (error) {
    console.error("❌ ownershipGuard error:", error);
    return res.status(500).json({
      message: "Error validando permisos de empresa",
    });
  }
};


// import { Request, Response, NextFunction } from "express";
// import { CompanyModel } from "../models/company.model.js";

// export const ownershipGuard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     const companyId =
//       req.params.companyId ||
//       req.body.companyId ||
//       req.user.companyId;

//     if (!companyId) {
//       return res.status(400).json({
//         message: "No se pudo determinar la empresa",
//       });
//     }

//     const company = await CompanyModel.findById(companyId);

//     if (!company) {
//       return res.status(404).json({
//         message: "Empresa no encontrada",
//       });
//     }

//     if (company.owner.toString() !== req.user.id) {
//       return res.status(403).json({
//         message: "No tienes permisos sobre esta empresa",
//       });
//     }

//     req.company = company;
//     next();
//   } catch (error) {
//     console.error("OwnershipGuard error:", error);
//     res.status(500).json({ message: "Error validando permisos" });
//   }
// };
