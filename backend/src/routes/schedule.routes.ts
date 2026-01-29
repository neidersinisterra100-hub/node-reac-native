import { Router } from "express";
import {
  getPendingTrips,
  applyScheduler,
} from "../controllers/schedule.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * ⚠️ IMPORTANTE
 * Estas rutas SOLO deben ser usadas por:
 * - Usuario técnico (role = system)
 * - n8n
 */

// Obtener qué viajes activar / desactivar
router.get("/pending-trips", requireAuth, getPendingTrips);

// Aplicar cambios
router.post("/apply", requireAuth, applyScheduler);

export default router;
