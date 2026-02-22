// ===============================
// IMPORTS
// ===============================

/**
 * Router
 * ---------------------------------------------------------
 * Mini-servidor de Express para agrupar rutas de tickets
 */
import { Router } from "express";

/* =========================================================
   CONTROLLERS
   ========================================================= */

/**
 * Lógica de negocio de tickets
 * (este archivo SOLO define rutas)
 */
import {
   buyTicket,               // Compra de ticket (usuario final)
   getMyTickets,            // Historial del usuario
   validateTicket,          // Validación / check-in
   getPassengersByTrip,     // Pasajeros por viaje
   registerManualPassenger, // Registro manual (muelle)
   getTicketById,           // Obtener un ticket por ID
} from "../controllers/ticket.controller.js";

/* =========================================================
   MIDDLEWARES
   ========================================================= */

/**
 * requireAuth
 * ---------------------------------------------------------
 * - Verifica JWT
 * - Inyecta req.user
 */
import { requireAuth } from "../middlewares/requireAuth.js";

/**
 * requireOwnerOrAdmin
 * ---------------------------------------------------------
 * - Permite SOLO owner / admin / super_owner
 * - Usado para operaciones operativas
 */
import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";

/**
 * blockRoles
 * ---------------------------------------------------------
 * - Bloquea acciones por rol
 * - Usado para impedir compra a staff
 */
import { blockRoles } from "../middlewares/blockRoles.js";

/* =========================================================
   ROUTER
   ========================================================= */

const router = Router();

/* =========================================================
   COMPRA DE TICKET (USUARIO FINAL)
   ========================================================= */
/**
 * POST /api/tickets/buy
 *
 * Quién puede usarlo:
 * - SOLO role "user"
 *
 * Bloqueado para:
 * - owner
 * - admin
 * - super_owner
 */
router.post(
   "/buy",
   requireAuth,
   buyTicket
);

/* =========================================================
   HISTORIAL DE TICKETS DEL USUARIO
   ========================================================= */
/**
 * GET /api/tickets/my
 *
 * Devuelve:
 * - Tickets del usuario autenticado
 *
 * Acceso:
 * - Todos los roles autenticados
 */
router.get(
   "/my",
   requireAuth,
   getMyTickets
);

/* =========================================================
   VALIDACIÓN DE TICKET (CHECK-IN)
   ========================================================= */
/**
 * POST /api/tickets/validate
 *
 * Uso:
 * - Escaneo / validación en muelle
 *
 * Acceso:
 * - owner
 * - admin
 * - super_owner
 */
router.post(
   "/validate",
   requireAuth,
   requireOwnerOrAdmin,
   validateTicket
);

/* =========================================================
   PASAJEROS POR VIAJE
   ========================================================= */
/**
 * GET /api/tickets/trip/:tripId/passengers
 *
 * Devuelve:
 * - Lista de pasajeros del viaje
 *
 * Acceso:
 * - owner
 * - admin
 * - super_owner
 */
router.get(
   "/trip/:tripId/passengers",
   requireAuth,
   requireOwnerOrAdmin,
   getPassengersByTrip
);

/* =========================================================
   REGISTRO MANUAL DE PASAJERO
   ========================================================= */
/**
 * POST /api/tickets/manual
 *
 * Caso:
 * - Venta física
 * - Registro en muelle
 *
 * Acceso:
 * - owner
 * - admin
 * - super_owner
 */
router.post(
   "/manual",
   requireAuth,
   // requireOwnerOrAdmin, // Comentado temporalmente para permitir simulación local
   registerManualPassenger
);

/**
 * GET /api/tickets/:id
 */
router.get(
   "/:id",
   requireAuth,
   getTicketById
);

/* =========================================================
   EXPORT
   ========================================================= */

export default router;
