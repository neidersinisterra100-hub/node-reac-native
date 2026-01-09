import { Router } from "express";
import {
  buyTicket,
  getMyTickets,
  validateTicket,
  getPassengersByTrip,
  registerManualPassenger,
} from "../controllers/ticket.controller.js";

import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";

const router = Router();

/* =========================================================
   COMPRA DE TICKET (USUARIO)
   ========================================================= */
router.post(
  "/buy",
  requireAuth,
  buyTicket
);

/* =========================================================
   HISTORIAL DEL USUARIO
   ========================================================= */
router.get(
  "/my",
  requireAuth,
  getMyTickets
);

/* =========================================================
   VALIDACIÓN DE TICKET (OWNER / ADMIN)
   ========================================================= */
router.post(
  "/validate",
  requireAuth,
  requireOwnerOrAdmin,
  validateTicket
);

/* =========================================================
   PASAJEROS POR VIAJE (OWNER / ADMIN)
   - Admin: solo viajes de su empresa
   - Owner: viajes de sus empresas
   ========================================================= */
router.get(
  "/trip/:tripId/passengers",
  requireAuth,
  requireOwnerOrAdmin,
  getPassengersByTrip
);

/* =========================================================
   REGISTRO MANUAL DE PASAJERO (OWNER / ADMIN)
   ========================================================= */
router.post(
  "/manual",
  requireAuth,
  requireOwnerOrAdmin,
  registerManualPassenger
);

export default router;



// import { Router } from "express";
// import {
//   buyTicket,
//   getMyTickets,
//   validateTicket,
//   // 👇 nuevas funciones (se crean después)
//   getPassengersByTrip,
//   registerManualPassenger,
// } from "../controllers/ticket.controller.js";

// import { requireAuth } from "../middlewares/auth.middleware.js";
// import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";

// const router = Router();

// /* =====================================================
//    COMPRA DE TICKET (USUARIO)
//    ===================================================== */
// router.post("/buy", requireAuth, buyTicket);

// /* =====================================================
//    HISTORIAL DEL USUARIO
//    ===================================================== */
// router.get("/my", requireAuth, getMyTickets);

// /* =====================================================
//    VALIDACIÓN DE TICKET (OWNER / ADMIN)
//    ===================================================== */
// router.post(
//   "/validate",
//   requireAuth,
//   requireOwnerOrAdmin,
//   validateTicket
// );

// /* =====================================================
//    PASAJEROS POR VIAJE (OWNER / ADMIN)
//    ===================================================== */
// router.get(
//   "/trip/:tripId/passengers",
//   requireAuth,
//   requireOwnerOrAdmin,
//   getPassengersByTrip
// );

// /* =====================================================
//    REGISTRO MANUAL DE PASAJERO (OWNER / ADMIN)
//    ===================================================== */
// router.post(
//   "/manual",
//   requireAuth,
//   requireOwnerOrAdmin,
//   registerManualPassenger
// );

// export default router;

