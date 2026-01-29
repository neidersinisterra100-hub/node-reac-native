import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createRouteSchema,
  updateRouteSchema,
} from "../schemas/route.schema.js";

import {
  createRoute,
  getRoutesByRole,
  getCompanyRoutes,
  toggleRouteActive,
  deleteRoute,
} from "../controllers/route.controller.js";

const router = Router();

// 📤 Lecturas públicas (usuarios pueden ver rutas activas)
router.get("/", getRoutesByRole);
router.get("/company/:companyId", getCompanyRoutes);

// 🔐 Mutaciones requieren autenticación
router.use(requireAuth);

// 🧱 Crear ruta (bloqueo legacy + validación)
router.post(
  "/",
  blockLegacyFields,
  validateRequest(createRouteSchema),
  createRoute
);

router.patch(
  "/:routeId",
  blockLegacyFields,
  validateRequest(updateRouteSchema),
  toggleRouteActive
);

router.delete("/:routeId", deleteRoute);

export default router;
