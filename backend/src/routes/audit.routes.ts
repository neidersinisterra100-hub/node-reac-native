import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getCompanyAudit, getMyAudit } from "../controllers/audit.controller.js";

const router = Router();

// Todas requieren auth
router.use(requireAuth);

/**
 * GET /api/audit/me
 * Actividad reciente del usuario autenticado
 */
router.get("/me", getMyAudit);

/**
 * GET /api/audit/company/:companyId
 * Logs de auditoría de una empresa (owner/admin)
 */
router.get("/company/:companyId", getCompanyAudit);

export default router;
