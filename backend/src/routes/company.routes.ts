import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";
import { ownershipGuard } from "../middlewares/ownership.guard.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";

import {
  createCompany,
  createCompanyWithAdmin, // We need to check if this is exported in controller
  getMyCompanies,
  toggleCompanyActive,
  deleteCompany,
  getCompany,
  getCompanyAdmins,
} from "../controllers/company.controller.js";

import { getCompanyRoutes } from "../controllers/route.controller.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../schemas/company.schema.js";

const router = Router();

/* ================= PUBLIC ================= */
// router.get("/", getPublicCompanies);

/* ================= CREATE ================= */
// Crear empresa
router.post(
  "/",
  requireAuth,
  requireOwner,
  blockLegacyFields,
  validateRequest(createCompanySchema),
  createCompany
);

// Crear empresa + admin
router.post(
  "/with-admin",
  requireAuth,
  requireOwner,
  blockLegacyFields,
  validateRequest(createCompanySchema),
  createCompanyWithAdmin
);

/* ================= MY COMPANIES ================= */
router.get("/my", requireAuth, getMyCompanies);

/* ================= COMPANY (OWNERSHIP) ================= */

// Obtener una empresa
router.get(
  "/:companyId",
  requireAuth,
  ownershipGuard,
  getCompany
);

// Activar / desactivar empresa
router.patch(
  "/:companyId",
  requireAuth,
  ownershipGuard,
  blockLegacyFields,
  validateRequest(updateCompanySchema),
  toggleCompanyActive
);

// Eliminar empresa
router.delete(
  "/:companyId",
  requireAuth,
  ownershipGuard,
  deleteCompany
);

// Admins de una empresa
router.get(
  "/:companyId/admins",
  requireAuth,
  ownershipGuard,
  createCompanyWithAdmin
);

// Rutas de una empresa (públicas o protegidas según tu negocio)
router.get("/:companyId/routes", getCompanyRoutes);

export default router;
