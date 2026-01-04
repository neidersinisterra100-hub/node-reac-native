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




// import { RequestHandler } from "express";
// import jwt from "jsonwebtoken";
// import { AuthUser } from "../@types/express/auth.js";

// export interface AuthRequest extends Express.Request {
//   user?: AuthUser;
// }

// export const requireAuth: RequestHandler = (
//   req,
//   res,
//   next
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

//     // 👇 cast controlado
//     (req as AuthRequest).user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch {
//     return res.status(401).json({
//       message: "Token inválido",
//     });
//   }
// };



// import { RequestHandler } from "express";
// import jwt from "jsonwebtoken";

// /* ================= TYPES ================= */

// export type UserRole = "user" | "owner" | "admin";

// export interface AuthUser {
//   id: string;
//   role: UserRole;
// }

// export interface AuthRequest extends Express.Request {
//   user?: AuthUser;
// }

// /* ================= MIDDLEWARE ================= */

// export const requireAuth: RequestHandler = (
//   req,
//   res,
//   next
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

//     // 👇 CAST CONTROLADO (CLAVE)
//     (req as AuthRequest).user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch {
//     return res.status(401).json({
//       message: "Token inválido",
//     });
//   }
// };



// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// /* ================= TYPES ================= */

// export type UserRole = "user" | "owner" | "admin";

// export interface AuthUser {
//   id: string;
//   role: UserRole;
// }

// export interface AuthRequest extends Request {
//   user?: AuthUser;
// }

// /* ================= MIDDLEWARE ================= */

// export const requireAuth = (
//   req: AuthRequest,
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

//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Token inválido",
//     });
//   }
// };



// // // middlewares/requireAuth.ts
// // import { RequestHandler } from "express";
// // import jwt from "jsonwebtoken";

// // export type UserRole = "user" | "owner" | "admin";

// // export interface AuthUser {
// //   id: string;
// //   role: UserRole;
// // }

// // export interface AuthRequest extends Express.Request {
// //   user?: AuthUser;
// // }

// // export const requireAuth: RequestHandler = (req, res, next) => {
// //   const authHeader = req.headers.authorization;

// //   if (!authHeader) {
// //     res.status(401).json({ message: "Token requerido" });
// //     return;
// //   }

// //   const token = authHeader.split(" ")[1];

// //   try {
// //     const decoded = jwt.verify(
// //       token,
// //       process.env.JWT_SECRET!
// //     ) as {
// //       id: string;
// //       role?: UserRole;
// //     };

// //     if (!decoded.role) {
// //       res.status(401).json({ message: "Rol inválido" });
// //       return;
// //     }

// //     (req as AuthRequest).user = {
// //       id: decoded.id,
// //       role: decoded.role,
// //     };

// //     next();
// //   } catch {
// //     res.status(401).json({ message: "Token inválido" });
// //   }
// // };



// // // import { Request, Response, NextFunction } from "express";
// // // import jwt from "jsonwebtoken";

// // // export type UserRole = "user" | "owner" | "admin";

// // // export interface AuthRequest extends Request {
// // //   user?: {
// // //     id: string;
// // //     role: UserRole;
// // //   };
// // // }

// // // export const requireAuth = (
// // //   req: AuthRequest,
// // //   res: Response,
// // //   next: NextFunction
// // // ) => {
// // //   const authHeader = req.headers.authorization;

// // //   if (!authHeader) {
// // //     return res.status(401).json({
// // //       message: "Token requerido",
// // //     });
// // //   }

// // //   const token = authHeader.split(" ")[1];

// // //   try {
// // //     const decoded = jwt.verify(
// // //       token,
// // //       process.env.JWT_SECRET!
// // //     ) as {
// // //       id: string;
// // //       role: UserRole;
// // //     };

// // //     req.user = {
// // //       id: decoded.id,
// // //       role: decoded.role,
// // //     };

// // //     next();
// // //   } catch {
// // //     return res.status(401).json({
// // //       message: "Token inválido",
// // //     });
// // //   }
// // // };



// // // // import { Request, Response, NextFunction } from "express";
// // // // import jwt from "jsonwebtoken";

// // // // /* ================= TYPES ================= */

// // // // type JwtPayload = {
// // // //   id: string;
// // // //   role: "user" | "admin" | "owner";
// // // // };

// // // // /* ================= MIDDLEWARE ================= */

// // // // export const requireAuth = (
// // // //   req: Request,
// // // //   res: Response,
// // // //   next: NextFunction
// // // // ) => {
// // // //   const authHeader = req.headers.authorization;

// // // //   if (!authHeader) {
// // // //     return res.status(401).json({
// // // //       message: "Token requerido",
// // // //     });
// // // //   }

// // // //   const token = authHeader.split(" ")[1];

// // // //   try {
// // // //     const decoded = jwt.verify(
// // // //       token,
// // // //       process.env.JWT_SECRET!
// // // //     ) as JwtPayload;

// // // //     // ✅ AHORA TS ESTÁ FELIZ
// // // //     req.user = {
// // // //       id: decoded.id,
// // // //       role: decoded.role,
// // // //     };

// // // //     next();
// // // //   } catch (error) {
// // // //     return res.status(401).json({
// // // //       message: "Token inválido",
// // // //     });
// // // //   }
// // // // };
