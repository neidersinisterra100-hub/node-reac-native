import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
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

// Rutas Públicas
router.get("/", getTrips); // Listar viajes activos para pasajeros

// Rutas Privadas (Requieren Auth)
router.use(requireAuth);

// 🛡️ Validación ANTES del controller
router.post("/", validateRequest(createTripSchema), createTrip);

router.get("/manage", getManageTrips); // Listar viajes para gestión (admin/owner)
router.get("/company/:companyId", getCompanyTrips); // Listar viajes de una empresa ESPECÍFICA
router.patch("/:tripId", toggleTripActive); // Activar/Desactivar
router.delete("/:tripId", deleteTrip); // Eliminar

export default router;
