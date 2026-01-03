import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/* ================= TYPES ================= */

type JwtPayload = {
  id: string;
  role: "user" | "admin" | "owner";
};

/* ================= MIDDLEWARE ================= */

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

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // ✅ AHORA TS ESTÁ FELIZ
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};
