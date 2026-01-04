import { Response, Request, NextFunction } from "express";


/**
 * Permite acceso SOLO a usuarios con rol:
 * - admin
 * - owner
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = req.user?.role;

  if (role !== "admin" && role !== "owner") {
    return res.status(403).json({
      message: "Acceso solo para administradores u owners",
    });
  }

  next();
};



// import { Request, Response, NextFunction } from "express";

// export const requireAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({
//       message: "Acceso solo para administradores",
//     });
//   }

//   next();
// };

