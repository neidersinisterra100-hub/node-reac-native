// ===============================
// IMPORTS
// ===============================

// Router es el mini-servidor de Express.
// Sirve para agrupar endpoints relacionados (tickets).
import { Router } from "express";

// Controllers:
// 👉 Aquí está la lógica que responde a cada endpoint.
// Este archivo SOLO define rutas, NO lógica.
import {
  buyTicket,                 // Comprar un ticket
  getMyTickets,              // Historial del usuario
  validateTicket,            // Validar ticket (check-in)
  getPassengersByTrip,       // Listar pasajeros por viaje
  registerManualPassenger,   // Registrar pasajero manualmente
} from "../controllers/ticket.controller.js";

// Middlewares de seguridad:

// requireAuth:
// 👉 Verifica que el usuario esté autenticado (JWT válido)
// 👉 Si falla, corta la request
import { requireAuth } from "../middlewares/requireAuth.js";

// requireOwnerOrAdmin:
// 👉 Verifica roles (OWNER o ADMIN)
// 👉 Se usa para operaciones sensibles
import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";

// ===============================
// CREACIÓN DEL ROUTER
// ===============================

// Este router será montado en:
// /api/tickets
const router = Router();

/* =========================================================
   COMPRA DE TICKET (USUARIO)
   ========================================================= */

/**
 * POST /api/tickets/buy
 *
 * Flujo:
 * 1️⃣ requireAuth → valida JWT
 * 2️⃣ buyTicket → lógica de compra
 *
 * Quién puede usarlo:
 * - Usuarios autenticados
 */
router.post(
  "/buy",
  requireAuth,
  buyTicket
);

/* =========================================================
   HISTORIAL DEL USUARIO
   ========================================================= */

/**
 * GET /api/tickets/my
 *
 * Devuelve:
 * - Todos los tickets del usuario autenticado
 *
 * Seguridad:
 * - requireAuth asegura que solo vea SUS tickets
 */
router.get(
  "/my",
  requireAuth,
  getMyTickets
);

/* =========================================================
   VALIDACIÓN DE TICKET (OWNER / ADMIN)
   ========================================================= */

/**
 * POST /api/tickets/validate
 *
 * Caso de uso:
 * - Check-in del pasajero
 * - Validar que el ticket sea válido
 *
 * Seguridad:
 * - requireAuth → usuario autenticado
 * - requireOwnerOrAdmin → solo personal autorizado
 */
router.post(
  "/validate",
  requireAuth,
  requireOwnerOrAdmin,
  validateTicket
);

/* =========================================================
   PASAJEROS POR VIAJE (OWNER / ADMIN)
   ========================================================= */
/**
 * GET /api/tickets/trip/:tripId/passengers
 *
 * Devuelve:
 * - Lista de pasajeros de un viaje específico
 *
 * Reglas de negocio implícitas:
 * - Admin → solo viajes de su empresa
 * - Owner → viajes de todas sus empresas
 *
 * Seguridad:
 * - Autenticación
 * - Autorización por rol
 */
router.get(
  "/trip/:tripId/passengers",
  requireAuth,
  requireOwnerOrAdmin,
  getPassengersByTrip
);

/* =========================================================
   REGISTRO MANUAL DE PASAJERO (OWNER / ADMIN)
   ========================================================= */

/**
 * POST /api/tickets/manual
 *
 * Caso de uso:
 * - Registrar pasajeros sin compra digital
 * - Venta física / registro en muelle
 *
 * Seguridad:
 * - Solo OWNER o ADMIN
 */
router.post(
  "/manual",
  requireAuth,
  requireOwnerOrAdmin,
  registerManualPassenger
);

// ===============================
// EXPORTACIÓN DEL ROUTER
// ===============================

// Este router es consumido por:
// app.use("/api/tickets", ticketRoutes);
export default router;
