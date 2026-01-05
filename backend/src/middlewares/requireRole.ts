import { RequestHandler } from "express";
import { AuthRequest } from "./requireAuth.js";
import { UserRole } from "../types/auth.js";

/**
 * Middleware para permitir acceso solo a ciertos roles
 * Ej: requireRole("owner"), requireRole("admin", "owner")
 */
export const requireRole =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /**
     * 🔒 Normalizamos por seguridad
     * (por si el token viene en MAYÚSCULAS)
     */
    const role = authReq.user.role.toLowerCase() as UserRole;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Permisos insuficientes",
      });
    }

    next();
  };



// import { RequestHandler } from "express";
// import { AuthRequest } from "./requireAuth.js";
// import { UserRole } from "../types/auth.js";

// export const requireRole =
//   (...allowedRoles: UserRole[]): RequestHandler =>
//   (req, res, next) => {
//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     if (!allowedRoles.includes(authReq.user.role)) {
//       return res
//         .status(403)
//         .json({ message: "Permisos insuficientes" });
//     }

//     next();
//   };
