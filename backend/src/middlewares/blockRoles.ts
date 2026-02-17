import { RequestHandler } from "express";

/**
 * blockRoles
 *
 * Bloquea el acceso a determinados roles.
 * Ej: bloquear admin/owner en flujos de usuario final.
 */
export const blockRoles = (
  blockedRoles: Array<"user" | "admin" | "owner" | "super_owner">
): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (blockedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Este rol no puede realizar esta acción",
      });
    }

    next();
  };
};
