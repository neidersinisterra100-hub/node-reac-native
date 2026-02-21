import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";
import { ownershipGuard } from "../middlewares/ownership.guard.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";

import {
  createCompany,
  createCompanyWithAdmin,
  getMyCompanies,
  getPublicCompanies,
  toggleCompanyActive,
  deleteCompany,
  getCompany,
  getCompanyAdmins,
  addAdmin,
  removeAdmin,
  inviteAdmin,
  acceptInvite,
} from "../controllers/company.controller.js";

import { getCompanyRoutes } from "../controllers/route.controller.js";
import {
  createCompanySchema,
  updateCompanySchema,
  inviteAdminSchema,
} from "../schemas/company.schema.js";

const router = Router();

/* ================= PUBLIC ================= */
router.get("/", getPublicCompanies);

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

// Aceptar invitación (antes de rutas con :companyId para evitar conflicto)
router.post(
  "/accept-invite",
  requireAuth,
  acceptInvite
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
  getCompanyAdmins // Fixed: was createCompanyWithAdmin
);

/* ================= COMPANY ADMIN MANAGEMENT ================= */

// Agregar admin directo
router.post(
  "/:companyId/admins",
  requireAuth,
  ownershipGuard,
  addAdmin
);

// Eliminar admin
router.delete(
  "/:companyId/admins/:adminId",
  requireAuth,
  ownershipGuard,
  removeAdmin
);

// Invitar admin por email
router.post(
  "/:companyId/invite-admin",
  requireAuth,
  ownershipGuard,
  validateRequest(inviteAdminSchema),
  inviteAdmin
);

// Rutas de una empresa (públicas o protegidas según tu negocio)
router.get("/:companyId/routes", getCompanyRoutes);

export default router;
