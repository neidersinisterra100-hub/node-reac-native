import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Estructura esperada del payload del JWT
 */
interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // 1️⃣ Verificar header
  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  // 2️⃣ Extraer token
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }

  try {
    // 3️⃣ Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 4️⃣ Adjuntar usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
}
