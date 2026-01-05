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

// LISTAR RUTAS DE UNA EMPRESA (OWNER)
router.get(
  "/company/:companyId",
  requireAuth,
  requireOwner,
  getCompanyRoutes
);

// CREAR RUTA → SOLO OWNER
router.post(
  "/",
  requireAuth,
  requireOwner,
  createRoute
);

router.patch(
  "/:routeId/toggle",
  requireAuth,
  requireOwner,
  toggleRouteActive
);


export default router;
