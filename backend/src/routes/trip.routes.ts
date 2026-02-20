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
   ASIENTOS POR VIAJE (PÚBLICO)
   =========================================================
   👉 Necesario para mostrar asientos disponibles
   antes de autenticación
   ========================================================= */

/**
 * GET /api/trips/companies/:companyId/trips/:tripId/seats
 * ---------------------------------------------------------
 * ✔️ Devuelve mapa de asientos
 * ✔️ PÚBLICO (no requiere auth)
 */
router.get("/companies/:companyId/trips/:tripId/seats", getTripSeats);

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
router.get(
  "/companies/:companyId/trips/manage",
  ownershipGuard,
  getManageTrips
);

// router.get(
//   "/manage",
//   ownershipGuard,
//   getManageTrips
// );
 
/* =========================================================
   DETALLE DE VIAJE
   ========================================================= */

/**
 * GET /api/trips/companies/:companyId/trips/:tripId
 * ---------------------------------------------------------
 * ✔️ Detalle de un viaje
 * ✔️ Accesible para usuarios autenticados
 *
 * ⚠️ Debe ir DESPUÉS de rutas más específicas
 */
router.get("/companies/:companyId/trips/:tripId", getTripById);

/* =========================================================
   VIAJES POR EMPRESA
   ========================================================= */

/**
 * GET /api/trips/company/:companyId
 * ---------------------------------------------------------
 * ✔️ Protegido por ownership
 * ✔️ Admin / Owner
 */
router.get(
  "/company/:companyId",
  ownershipGuard,
  getCompanyTrips
);

/* =========================================================
   CREACIÓN DE VIAJES
   ========================================================= */

/**
 * POST /api/trips
 * ---------------------------------------------------------
 * ✔️ SOLO owner
 * ✔️ Protegido por ownershipGuard
 * ✔️ Valida esquema
 */
router.post(
  "/",
  ownershipGuard,
  blockLegacyFields,
  validateRequest(createTripSchema),
  createTrip
);

/* =========================================================
   MUTACIONES
   ========================================================= */

/**
 * PATCH /api/trips/companies/:companyId/trips/:tripId
 * ---------------------------------------------------------
 * Activa / desactiva viaje
 */
router.patch(
  "/companies/:companyId/trips/:tripId",
  ownershipGuard,
  toggleTripActive
);

/**
 * DELETE /api/trips/companies/:companyId/trips/:tripId
 * ---------------------------------------------------------
 * Elimina viaje
 */
router.delete(
  "/companies/:companyId/trips/:tripId",
  ownershipGuard,
  deleteTrip
);

export default router;
