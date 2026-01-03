import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extendemos Request para incluir user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const requireAuth = (
  req: AuthRequest,
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

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    // ✅ ahora TS sabe que existe
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};

