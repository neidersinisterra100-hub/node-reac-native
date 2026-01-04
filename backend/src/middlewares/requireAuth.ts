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
  const authReq = req as AuthRequest;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthUser;

    authReq.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// /* ================= TYPES ================= */

// /* ================= MIDDLEWARE ================= */
