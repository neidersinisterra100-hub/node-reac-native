import { Router } from "express";
import {
  getTrips,
  createTrip,
} from "../controllers/trip.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PUBLIC ================= */

// LISTAR VIAJES (PÚBLICO)
router.get("/", getTrips);

/* ================= PROTECTED ================= */

// CREAR VIAJE → SOLO OWNER
router.post(
  "/",
  requireAuth,   // 🔐 usuario autenticado
  requireOwner,  // 🔐 solo owner
  createTrip     // 🧠 lógica de negocio
);

export default router;


// import { Router } from "express";
// import {
//   getTrips,
//   createTrip,
// } from "../controllers/trip.controller.js";
// import { requireAuth } from "../middlewares/requireAuth.js";
// import { requireOwner } from "../middlewares/requireOwner.js";

// const router = Router();

// /* ================= PUBLIC ================= */

// // LISTAR VIAJES
// router.get("/", getTrips);

// /* ================= PROTECTED ================= */

// // CREAR VIAJE → SOLO OWNER
// router.post(
//   "/",
//   requireAuth,
//   requireOwner,
//   createTrip
// );

// export default router;

