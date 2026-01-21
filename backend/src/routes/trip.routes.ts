import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { blockLegacyFields } from "../middlewares/blockLegacyFields.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createTripSchema } from "../schemas/trip.schema.js";

import {
  createTrip,
  getTrips,
  toggleTripActive,
  deleteTrip,
  getManageTrips,
  getCompanyTrips,
} from "../controllers/trip.controller.js";

const router = Router();

// 🌍 Público
router.get("/", getTrips);

// 🔐 Privado
router.use(requireAuth);

// 🧱 Crear viaje (bloqueo legacy + validación)
router.post(
  "/",
  blockLegacyFields,
  validateRequest(createTripSchema),
  createTrip
);

// Gestión
router.get("/manage", getManageTrips);
router.get("/company/:companyId", getCompanyTrips);

// Mutaciones
router.patch("/:tripId", toggleTripActive);
router.delete("/:tripId", deleteTrip);

export default router;
