import { Router } from "express";
import {
  getTrips,
  createTrip,
  toggleTripActive
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

// TOGGLE VIAJE (OWNER & ADMIN)
router.patch(
  "/:tripId",
  requireAuth,
  toggleTripActive
);

export default router;
