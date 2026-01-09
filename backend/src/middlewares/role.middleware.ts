import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth.js";

// 🔐 Roles válidos del sistema
type UserRole = "owner" | "admin" | "user";

export const requireOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;

  // 🔒 Usuario no autenticado
  if (!authReq.user || !authReq.user.role) {
    return res.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  const role: UserRole = authReq.user.role as UserRole;

  // 🔒 Control de acceso
  if (!["owner", "admin"].includes(role)) {
    return res.status(403).json({
      message: "Acceso denegado",
    });
  }

  next();
};
