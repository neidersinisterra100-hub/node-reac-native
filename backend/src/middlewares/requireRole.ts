import { RequestHandler } from "express";
import { UserRole } from "../types/auth.js";

/* =========================================================
   REQUIRE ROLE
   ---------------------------------------------------------
   Middleware genérico para restringir acceso por rol.
   
   Reglas:
   - requireAuth DEBE ejecutarse antes
   - Usa req.user (inyectado por JWT)
   
   Ejemplos:
   - requireRole("owner")
   - requireRole("admin", "owner")
   ========================================================= */

export const requireRole =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    /* =====================================================
       SEGURIDAD BASE
       ===================================================== */
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* =====================================================
       NORMALIZACIÓN DE ROL
       -----------------------------------------------------
       - Protege contra tokens mal formados
       ===================================================== */
    const role = req.user.role.toLowerCase() as UserRole;

    /* =====================================================
       VALIDACIÓN DE PERMISOS
       ===================================================== */
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Permisos insuficientes",
      });
    }

    /* =====================================================
       TODO OK
       ===================================================== */
    next();
  };
