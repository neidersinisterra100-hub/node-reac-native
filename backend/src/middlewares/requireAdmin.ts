import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Acceso solo para administradores",
    });
  }

  next();
};


// import { Request, Response, NextFunction } from "express";

// export function requireAdmin(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   if (req.user?.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "Acceso restringido" });
//   }
//   next();
// }
