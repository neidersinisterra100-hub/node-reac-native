import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { JwtPayload } from "../@types/express/auth.js";

export type AuthRequest = Request;

/**
 * requireAuth
 *
 * Middleware de autenticación JWT.
 *
 * Responsabilidades:
 * - Verificar presencia del token
 * - Validar firma y expiración
 * - Inyectar identidad mínima en req.user
 *
 * ⚠️ NOTAS DE DISEÑO:
 * - El JWT NO contiene email
 * - req.user solo tiene datos estables (id, role, companyId)
 * - Datos sensibles se consultan en BD cuando se necesitan
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Token presente
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2️⃣ Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as Express.UserPayload;


    // 3️⃣ Inyectar identidad mínima en req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch {
    // 4️⃣ Token inválido o expirado
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
