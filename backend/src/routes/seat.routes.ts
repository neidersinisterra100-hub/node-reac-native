import { Router } from "express";

/* =========================================================
   MIDDLEWARES
   ========================================================= */

/**
 * requireAuth
 * ---------------------------------------------------------
 * - Valida JWT
 * - Inyecta req.user
 */
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";

/**
 * blockRoles
 * ---------------------------------------------------------
 * - Bloquea acceso por rol
 * - Usado para impedir que OWNER / ADMIN / SUPER_OWNER
 *   reserven asientos (solo usuarios finales pueden)
 */
import { blockRoles } from "../middlewares/blockRoles.js";

/* =========================================================
   CONTROLLERS
   ========================================================= */

/**
 * seat.controller
 * ---------------------------------------------------------
 * Maneja el ciclo de vida del BLOQUEO TEMPORAL de asientos:
 * - reserve  → bloquear asiento (TTL en Mongo)
 * - confirm  → confirmar asiento tras pago
 * - release  → liberar asiento manualmente
 */
import {
   reserveSeatHandler,
   confirmSeatHandler,
   releaseSeatHandler,
   clearTripLocksHandler,
} from "../controllers/seat.controller.js";

/* =========================================================
   ROUTER
   ========================================================= */

const router = Router();

/* =========================================================
   POST /api/seats/reserve
   ---------------------------------------------------------
   Bloquea un asiento por tiempo limitado (TTL).

   REGLAS DE NEGOCIO:
   - Requiere autenticación
   - SOLO role "user" puede reservar
   - OWNER / ADMIN / SUPER_OWNER → 403
   - Un usuario solo puede tener 1 asiento bloqueado
   - Si el asiento ya existe → 409
   ========================================================= */
router.post(
   "/reserve",
   requireAuth,
   blockRoles(["owner", "admin", "super_owner"]),
   reserveSeatHandler
);

/* =========================================================
   POST /api/seats/confirm
   ---------------------------------------------------------
   Confirma el asiento después del pago exitoso.

   EFECTO:
   - Elimina el documento de SeatReservation
   - El Ticket pasa a ser la fuente de verdad
   ========================================================= */
router.post(
   "/confirm",
   requireAuth,
   confirmSeatHandler
);

/* =========================================================
   POST /api/seats/release
   ---------------------------------------------------------
   Libera manualmente un asiento bloqueado.

   CASOS DE USO (frontend):
   - Usuario presiona “Cancelar”
   - Usuario hace goBack
   - Usuario hace logout
   - App pasa a background
   - App se cierra (best effort)
   ========================================================= */
router.post(
   "/release",
   requireAuth,
   releaseSeatHandler
);

/* =========================================================
   EXPORT
   ========================================================= */

export default router;

/* =========================================================
   POST /api/seats/clear-trip-locks
   ---------------------------------------------------------
   [ADMIN] Libera TODOS los asientos temporalmente bloqueados de un viaje.
   ========================================================= */
router.post(
   "/clear-trip-locks",
   requireAuth,
   requireOwnerOrAdmin,
   clearTripLocksHandler
);
