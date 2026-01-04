// middlewares/requireAdminOrOwner.ts
import { RequestHandler } from "express";
import { AuthRequest } from "./requireAuth.js";

export const requireAdminOrOwner: RequestHandler = (
  req,
  res,
  next
) => {
  const user = (req as AuthRequest).user;

  if (!user) {
    res.status(401).json({ message: "No autenticado" });
    return;
  }

  if (user.role !== "admin" && user.role !== "owner") {
    res
      .status(403)
      .json({ message: "Acceso solo para administradores u owners" });
    return;
  }

  next();
};



// import { Response, NextFunction } from "express";
// import { AuthRequest } from "./requireAuth.js";

// export const requireAdminOrOwner = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.user) {
//     return res.status(401).json({
//       message: "No autenticado",
//     });
//   }

//   if (req.user.role !== "admin" && req.user.role !== "owner") {
//     return res.status(403).json({
//       message: "Acceso solo para administradores u owners",
//     });
//   }

//   next();
// };
