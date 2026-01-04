import { RequestHandler } from "express";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

export const createCompany: RequestHandler = async (
  req,
  res
) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { name } = req.body;

  const company = await CompanyModel.create({
    name,
    owner: authReq.user.id,
  });

  res.status(201).json(company);
};
