import { Request, Response, NextFunction } from "express";

// Request extendido que incluye `user`
import { AuthRequest } from "./requireAuth.js";

/* =========================================================
   MIDDLEWARE DE AUTORIZACIÓN POR ROL
   ========================================================= */

/**
 * requireOwnerOrAdmin
 *
 * Permite el acceso únicamente a:
 * - owner
 * - admin
 *
 * Responsabilidad:
 * - Verificar que el usuario esté autenticado
 * - Verificar que tenga rol autorizado
 *
 * ❌ No consulta base de datos
 * ❌ No valida empresa (eso es otro middleware)
 */
export const requireOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Cast explícito para acceder a req.user
  const authReq = req as AuthRequest;

  /* =========================
     1. VERIFICAR AUTENTICACIÓN
     ========================= */

  // Si no hay usuario autenticado, se bloquea
  if (!authReq.user) {
    return res.status(401).json({
      message: "Usuario no autenticado",
    });
  }

  /* =========================
     2. VERIFICAR ROL
     ========================= */

  const { role } = authReq.user;

  // Solo owner y admin pueden pasar
  if (role !== "owner" && role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado",
    });
  }

  /* =========================
     3. CONTINUAR
     ========================= */
  next();
};


// import { Request, Response, NextFunction } from "express";
// import { AuthRequest } from "./requireAuth.js";

// // 🔐 Roles válidos del sistema
// type UserRole = "owner" | "admin" | "user";

// export const requireOwnerOrAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authReq = req as AuthRequest;

//   // 🔒 Usuario no autenticado
//   if (!authReq.user || !authReq.user.role) {
//     return res.status(401).json({
//       message: "Usuario no autenticado",
//     });
//   }

//   const role: UserRole = authReq.user.role as UserRole;

//   // 🔒 Control de acceso
//   if (!["owner", "admin"].includes(role)) {
//     return res.status(403).json({
//       message: "Acceso denegado",
//     });
//   }

//   next();
// };
