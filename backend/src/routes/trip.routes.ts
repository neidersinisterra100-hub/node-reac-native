import { Router } from "express";

// ===============================
// MIDDLEWARES
// ===============================
import { requireAuth } from "../middlewares/requireAuth.js";
import { ownershipGuard } from "../middlewares/ownership.guard.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";

// ===============================
// VALIDACIÓN
// ===============================
import { createTripSchema } from "../schemas/trip.schema.js";

// ===============================
// CONTROLLERS
// ===============================
import {
  createTrip,
  getTrips,
  toggleTripActive,
  deleteTrip,
  getManageTrips,
  getCompanyTrips,
} from "../controllers/trip.controller.js";

const router = Router();

/* =========================================================
   PÚBLICO
   ---------------------------------------------------------
   - Cualquier usuario puede consultar viajes disponibles
   - Usado para marketplace / búsqueda
   ========================================================= */

router.get("/", getTrips);

/* =========================================================
   PRIVADO (REQUIERE AUTH)
   ---------------------------------------------------------
   - A partir de aquí todos requieren JWT
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   CREAR VIAJE
   ---------------------------------------------------------
   - Solo usuarios con ownership sobre la empresa
   - Usa req.user.companyId
   ========================================================= */

router.post(
  "/",
  ownershipGuard,
  blockLegacyFields,
  validateRequest(createTripSchema),
  createTrip
);

/* =========================================================
   GESTIÓN DE VIAJES
   ---------------------------------------------------------
   - Vista administrativa (panel)
   - Usa empresa del JWT
   ========================================================= */

router.get(
  "/manage",
  ownershipGuard,
  getManageTrips
);

/* =========================================================
   VIAJES DE UNA EMPRESA
   ---------------------------------------------------------
   - Parametrizado por companyId
   - Protegido por ownership
   ========================================================= */

router.get(
  "/company/:companyId",
  ownershipGuard,
  getCompanyTrips
);

/* =========================================================
   MUTACIONES DE VIAJES
   ---------------------------------------------------------
   - Activar / desactivar
   - Eliminar
   - Siempre con ownership
   ========================================================= */

router.patch(
  "/:tripId",
  ownershipGuard,
  toggleTripActive
);

router.delete(
  "/:tripId",
  ownershipGuard,
  deleteTrip
);

export default router;
