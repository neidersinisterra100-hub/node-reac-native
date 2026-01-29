import { Request, Response, NextFunction } from "express";

/* =========================================================
   REQUIRE OWNER OR ADMIN
   ---------------------------------------------------------
   Middleware de autorización por rol.
   
   Permite acceso únicamente a:
   - owner
   - admin

   ⚠️ IMPORTANTE:
   - requireAuth DEBE ejecutarse antes
   - NO consulta base de datos
   - NO valida empresa (eso es otro middleware)
   ========================================================= */

export const requireOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* =====================================================
     1. VERIFICAR AUTENTICACIÓN
     ===================================================== */
  if (!req.user) {
    return res.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  /* =====================================================
     2. VERIFICAR ROL
     ===================================================== */
  const { role } = req.user;

  if (role !== "owner" && role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado",
    });
  }

  /* =====================================================
     3. CONTINUAR
     ===================================================== */
  next();
};
