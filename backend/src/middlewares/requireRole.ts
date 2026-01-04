import { RequestHandler } from "express";
import { AuthRequest } from "./requireAuth.js";
import { UserRole } from "../types/auth.js";

export const requireRole =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res
        .status(403)
        .json({ message: "Permisos insuficientes" });
    }

    next();
  };




// import { RequestHandler } from "express";
// import { AuthRequest } from "./requireAuth.js";
// import { UserRole } from "../@types/express/auth.js";

// export const requireRole =
//   (...roles: UserRole[]): RequestHandler =>
//   (req, res, next) => {
//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     if (!roles.includes(authReq.user.role)) {
//       return res.status(403).json({
//         message:
//           "Acceso solo para administradores u owners",
//       });
//     }

//     next();
//   };
