import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../@types/express/auth.js";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // 🔐 SOLO identidad y permisos
    req.user = {
      id: decoded.id,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
