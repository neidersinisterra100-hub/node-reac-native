import { Router } from "express";
import {
  createCompany,
  getMyCompanies,
  getAllCompanies, // 👈 IMPORTADO
  toggleCompanyActive,
  deleteCompany
} from "../controllers/company.controller.js";
import { getCompanyRoutes } from "../controllers/route.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PUBLIC ================= */

// Listar empresas PÚBLICAS (activas)
router.get("/", getAllCompanies);

/* ================= OWNER ================= */

// Crear empresa (solo OWNER)
router.post(
  "/",
  requireAuth,
  requireOwner,
  createCompany
);

// Listar mis empresas (OWNER & ADMIN)
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
// Nota: Deberíamos tener un endpoint público para esto también si User va a ver rutas.
// Pero getAllRoutes en frontend ya usa getCompanyRoutes, que actualmente requiereAuth.
// Deberíamos hacer pública getCompanyRoutes o crear una versión pública.
router.get(
  "/:companyId/routes",
  // requireAuth, // 👈 TEMPORAL: Comentar auth para que user pueda ver rutas de empresa pública
  getCompanyRoutes
);

export default router;
