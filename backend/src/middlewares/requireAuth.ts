import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth.js";

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token malformado",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as Partial<AuthUser>;

    // 🔒 VALIDACIÓN MÍNIMA OBLIGATORIA
    if (!decoded.id || !decoded.email) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    // 🔒 ROLES PERMITIDOS
    const allowedRoles: AuthUser["role"][] = [
      "user",
      "owner",
      "admin",
    ];

    const role = allowedRoles.includes(
      decoded.role as AuthUser["role"]
    )
      ? (decoded.role as AuthUser["role"])
      : "user";

    const authUser: AuthUser = {
      id: decoded.id,
      email: decoded.email,
      role,
      companyId: decoded.companyId ?? undefined,
    };

    (req as AuthRequest).user = authUser;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
