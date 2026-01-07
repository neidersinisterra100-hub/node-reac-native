import { Router } from "express";
import { 
  createCompany, 
  getMyCompanies,
  toggleCompanyActive,
  deleteCompany
} from "../controllers/company.controller.js";
import { getCompanyRoutes } from "../controllers/route.controller.js";
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

// Listar empresas (OWNER & ADMIN)
router.get(
  "/my",
  requireAuth,
  getMyCompanies
);

// Toggle Activo (OWNER & ADMIN)
router.patch(
  "/:companyId",
  requireAuth,
  toggleCompanyActive
);

// ELIMINAR EMPRESA (OWNER)
router.delete(
  "/:companyId",
  requireAuth,
  requireOwner,
  deleteCompany
);

// Nested Routes: Get routes for a company (OWNER & ADMIN)
router.get(
  "/:companyId/routes",
  requireAuth,
  getCompanyRoutes
);

export default router;
