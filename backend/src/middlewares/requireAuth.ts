import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Tipo centralizado del usuario autenticado
// ⚠️ ESTE TIPO ES LA FUENTE DE LA VERDAD
import { AuthUser } from "../types/auth.js";

/* =========================================================
   EXTENSIÓN DEL REQUEST DE EXPRESS
   ========================================================= */

/**
 * AuthRequest extiende Request para agregar `user`
 *
 * IMPORTANTE:
 * - Express NO sabe que `req.user` existe
 * - Por eso debemos extender el tipo
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/* =========================================================
   MIDDLEWARE: REQUIRE AUTH
   ========================================================= */

/**
 * Middleware de autenticación
 *
 * Responsabilidad:
 * - Leer el token JWT
 * - Verificar que sea válido
 * - Extraer SOLO la info mínima del usuario
 * - Adjuntar el usuario tipado a req.user
 *
 * ❌ NO consulta base de datos
 * ❌ NO tiene lógica de negocio
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* =========================
     1. LEER HEADER
     ========================= */
  const authHeader = req.headers.authorization;

  // Si no hay header Authorization → no autenticado
  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  /* =========================
     2. EXTRAER TOKEN
     ========================= */
  // Formato esperado:
  // Authorization: Bearer <token>
  const token = authHeader.split(" ")[1];

  /* =========================
     3. VERIFICAR TOKEN
     ========================= */
  try {
    // Decodificamos el JWT
    // ⚠️ jwt.verify NO valida tipos, solo firma
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as Partial<AuthUser>;

    /* =========================
       4. CONSTRUIR AUTH USER
       ========================= */

    /**
     * Aquí está la CORRECCIÓN CLAVE 👇
     *
     * - Definimos explícitamente qué propiedades
     *   existen en AuthUser
     * - Controllers NO deben usar `_id`
     * - Controllers SÍ pueden usar `email`
     */
    const authUser: AuthUser = {
      // ID normalizado (string)
      id: decoded.id as string,

      // Email requerido para pagos (Wompi)
      email: decoded.email as string,

      // Rol normalizado (fallback seguro)
      role: (decoded.role as AuthUser["role"]) ?? "user",

      // Empresa opcional (admin / owner)
      companyId: decoded.companyId ?? undefined,
    };

    /* =========================
       5. ADJUNTAR USUARIO AL REQUEST
       ========================= */

    // Cast necesario porque Express no conoce AuthRequest
    (req as AuthRequest).user = authUser;

    // Continuar con la request
    next();
  } catch (error) {
    // Token inválido, expirado o manipulado
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};



// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { AuthUser } from "../types/auth.js";

// /**
//  * Request extendido con usuario autenticado
//  */
// export interface AuthRequest extends Request {
//   user?: AuthUser;
// }

// /**
//  * Middleware: requiere token válido
//  */
// export const requireAuth = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({
//       message: "Token requerido",
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//     ) as AuthUser;

//     /**
//      * 🔒 Seguridad extra:
//      * - role SIEMPRE en minúscula
//      * - nunca undefined
//      */
//     const authUser: AuthUser = {
//       id: decoded.id,
//       role: decoded.role ?? "user",
//     };

//     (req as AuthRequest).user = authUser;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Token inválido",
//     });
//   }
// };
