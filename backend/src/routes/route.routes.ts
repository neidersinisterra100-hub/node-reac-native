import { Router } from "express";
import {
  createRoute,
  getCompanyRoutes,
  toggleRouteActive,
} from "../controllers/route.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PROTECTED ================= */

// LISTAR RUTAS DE UNA EMPRESA (OWNER & ADMIN)
router.get(
  "/company/:companyId",
  requireAuth,
  getCompanyRoutes
);

// CREAR RUTA → SOLO OWNER
router.post(
  "/",
  requireAuth,
  requireOwner,
  createRoute
);

// TOGGLE RUTA (OWNER & ADMIN)
router.patch(
  "/:routeId",
  requireAuth,
  toggleRouteActive
);


export default router;
