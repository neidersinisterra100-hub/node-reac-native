import { Router } from "express";
import { createTrip, getTrips, } from "../controllers/trip.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

// LISTAR VIAJES (PÚBLICO)
router.get("/", getTrips);

// CREAR VIAJE (ADMIN)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createTrip
);

export default router;
