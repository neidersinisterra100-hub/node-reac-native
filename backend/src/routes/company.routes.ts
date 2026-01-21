import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../schemas/company.schema.js";

import {
  createCompany,
  createCompanyWithAdmin,
  getMyCompanies,
  toggleCompanyActive,
  deleteCompany,
  getCompanyAdmins,
} from "../controllers/company.controller.js";

import { getCompanyRoutes } from "../controllers/route.controller.js";

const router = Router();

/* ================= OWNER ================= */

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

// Listar mis empresas
router.get("/my", requireAuth, getMyCompanies);

// Activar / desactivar empresa
router.patch(
  "/:companyId",
  requireAuth,
  blockLegacyFields,
  validateRequest(updateCompanySchema),
  toggleCompanyActive
);

// Eliminar empresa
router.delete(
  "/:companyId",
  requireAuth,
  requireOwner,
  deleteCompany
);

// Rutas de una empresa
router.get("/:companyId/routes", getCompanyRoutes);

// Admins de una empresa
router.get("/:companyId/admins", requireAuth, getCompanyAdmins);

export default router;
