import { RequestHandler } from "express";
import { AuthRequest } from "./requireAuth.js";

export const requireOwner: RequestHandler = (
  req,
  res,
  next
) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res.status(401).json({
      message: "No autenticado",
    });
  }

  if (authReq.user.role !== "owner") {
    return res.status(403).json({
      message: "Solo owners pueden realizar esta acción",
    });
  }

  next();
};
