import { Router } from "express";

/* =========================================================
   MIDDLEWARES
   ========================================================= */
import { requireAuth } from "../middlewares/requireAuth.js";
import { ownershipGuard } from "../middlewares/ownership.guard.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";

/* =========================================================
   VALIDACIÓN
   ========================================================= */
import { createTripSchema } from "../schemas/trip.schema.js";

/* =========================================================
   CONTROLLERS
   ========================================================= */
import {
   createTrip,
   getTrips,        // 👈 PÚBLICO (marketplace)
   getTripById,
   getManageTrips, // 👈 PRIVADO (admin / owner)
   getCompanyTrips,
   toggleTripActive,
   deleteTrip,
} from "../controllers/trip.controller.js";

import { getTripSeats } from "../controllers/seat.controller.js";

const router = Router();

/* =========================================================
   RUTAS PÚBLICAS (NO AUTH)
   =========================================================
   👉 CUALQUIER usuario (incluido role=user)
   👉 Marketplace / búsqueda / compra
   ========================================================= */

/**
 * GET /api/trips
 * ---------------------------------------------------------
 * ✔️ Ruta pública
 * ✔️ Usada por usuarios normales (role=user)
 * ✔️ Devuelve SOLO viajes activos
 */
router.get("/", getTrips);

/* =========================================================
   ASIENTOS POR VIAJE (PÚBLICO / OPCIONAL AUTH)
   =========================================================
   👉 Necesario para mostrar asientos disponibles
   👉 Se usa requireAuth pero OPCIONAL para identificar usuario
   ========================================================= */

/**
 * GET /api/trips/companies/:companyId/trips/:tripId/seats
 * ---------------------------------------------------------
 * ✔️ Devuelve mapa de asientos
 * ✔️ requireAuth añadido para identificar si el asiento es del propio usuario
 */
router.get("/companies/:companyId/trips/:tripId/seats", requireAuth, getTripSeats);

/* =========================================================
   A PARTIR DE AQUÍ: RUTAS PRIVADAS
   =========================================================
   ⚠️ TODAS requieren JWT válido
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   GESTIÓN / PANEL ADMINISTRATIVO
   =========================================================
   ⚠️ IMPORTANTE:
   - role=user ❌ NO debe acceder aquí
   - admin / owner ✔️ SÍ
   ========================================================= */

/**
 * GET /api/trips/manage
 * ---------------------------------------------------------
 * ✔️ SOLO admin / owner
 * ❌ role=user será bloqueado por ownershipGuard
 *
 * 🔴 El frontend NO debe llamar esta ruta
 *    si el usuario es role=user
 */
// Habilitamos la ruta corta para el frontend móvil (getTripsForPassengerControl)
router.get(
   "/manage",
   getManageTrips
);

router.get(
   "/companies/:companyId/manage",
   ownershipGuard,
   getCompanyTrips
);

/**
 * POST /api/trips
 */
router.post(
   "/",
   ownershipGuard,
   blockLegacyFields,
   validateRequest(createTripSchema),
   createTrip
);

/**
 * PATCH /api/trips/:id/toggle
 */
router.patch(
   "/:id/toggle",
   ownershipGuard,
   toggleTripActive
);

/**
 * DELETE /api/trips/:id
 */
router.delete(
   "/:id",
   ownershipGuard,
   deleteTrip
);

/**
 * GET /api/trips/:id
 */
router.get("/:id", getTripById);

export default router;
