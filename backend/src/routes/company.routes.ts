import { Router } from "express";
import {
  createCompany,
  getMyCompanies,
} from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= OWNER ================= */

// Crear empresa (solo OWNER)
router.post(
  "/",
  requireAuth,
  requireOwner,
  createCompany
);

// Listar mis empresas (solo OWNER)
router.get(
  "/my",
  requireAuth,
  requireOwner,
  getMyCompanies
);

export default router;
