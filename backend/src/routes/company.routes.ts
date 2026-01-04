import { Router } from "express";
import { createCompany } from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireOwner,
  createCompany
);

export default router;
