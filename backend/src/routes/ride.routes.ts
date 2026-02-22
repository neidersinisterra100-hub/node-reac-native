import { Router } from "express";
import {
    requestRide,
    acceptRide,
    getRideStatus,
    updateRideStatus
} from "../controllers/ride.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

/**
 * @route   POST /api/rides/request
 * @desc    Solicitar un nuevo viaje (Cliente)
 * @access  Private (User)
 */
router.post("/request", requireAuth, requestRide);

/**
 * @route   PATCH /api/rides/:rideId/accept
 * @desc    Aceptar un viaje pendiente (Conductor)
 * @access  Private (Driver)
 */
router.patch("/:rideId/accept", requireAuth, acceptRide);

/**
 * @route   GET /api/rides/:rideId
 * @desc    Obtener detalles y estado de un viaje
 * @access  Private (User/Driver)
 */
router.get("/:rideId", requireAuth, getRideStatus);

/**
 * @route   PATCH /api/rides/:rideId/status
 * @desc    Actualizar el estado del viaje (Llegada, En curso, Completado)
 * @access  Private (Driver)
 */
router.patch("/:rideId/status", requireAuth, updateRideStatus);

export default router;
