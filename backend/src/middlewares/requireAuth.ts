import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth.js";

/**
 * Request extendido con usuario autenticado
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Middleware: requiere token válido
 */
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
    ) as AuthUser;

    /**
     * 🔒 Seguridad extra:
     * - role SIEMPRE en minúscula
     * - nunca undefined
     */
    const authUser: AuthUser = {
      id: decoded.id,
      role: decoded.role ?? "user",
    };

    (req as AuthRequest).user = authUser;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};



// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { AuthUser } from "../types/auth.js";

// export interface AuthRequest extends Request {
//   user?: AuthUser;
// }

// export const requireAuth = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authReq = req as AuthRequest;
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "Token requerido" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//     ) as AuthUser;

//     authReq.user = decoded;
//     next();
//   } catch {
//     return res.status(401).json({ message: "Token inválido" });
//   }
// };

// /* ================= TYPES ================= */

// /* ================= MIDDLEWARE ================= */
