import { RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { RideRequestModel, RideStatus } from "../models/rideRequest.model.js";
import { DriverProfileModel } from "../models/driverProfile.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   SCHEMAS DE VALIDACIÓN
   ========================================================= */

const requestRideSchema = z.object({
    origin: z.object({
        address: z.string().min(3),
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    destination: z.object({
        address: z.string().min(3),
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    price: z.number().min(0),
});

/* =========================================================
   SOLICITAR VIAJE (CLIENTE)
   ========================================================= */

export const requestRide: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const parsed = requestRideSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Datos de solicitud inválidos",
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const ride = await RideRequestModel.create({
            customerId: new Types.ObjectId(authReq.user.id),
            origin: parsed.data.origin,
            destination: parsed.data.destination,
            price: parsed.data.price,
            status: RideStatus.WAITING,
            requestedAt: new Date(),
        });

        return res.status(201).json(ride);
    } catch (error) {
        console.error("❌ [requestRide] Error:", error);
        return res.status(500).json({ message: "Error al procesar la solicitud de viaje" });
    }
};

/* =========================================================
   ACEPTAR VIAJE (CONDUCTOR)
   ========================================================= */

export const acceptRide: RequestHandler = async (req, res) => {
    try {
        const authReq = req as AuthRequest;

        // Solo conductores pueden aceptar
        if (!authReq.user || authReq.user.role !== "driver") {
            return res.status(403).json({ message: "Solo conductores autorizados pueden aceptar viajes" });
        }

        const { rideId } = req.params;
        const ride = await RideRequestModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }

        if (ride.status !== RideStatus.WAITING) {
            return res.status(400).json({ message: "El viaje ya ha sido aceptado o cancelado" });
        }

        // Verificar perfil del conductor
        const driverProfile = await DriverProfileModel.findOne({ userId: authReq.user.id });
        if (!driverProfile || !driverProfile.vehicleId) {
            return res.status(400).json({ message: "Debes configurar tu vehículo antes de aceptar viajes" });
        }

        // Asignar conductor y vehículo
        ride.driverId = new Types.ObjectId(authReq.user.id);
        ride.vehicleId = driverProfile.vehicleId;
        ride.status = RideStatus.ACCEPTED;
        ride.acceptedAt = new Date();
        await ride.save();

        // Marcar conductor como no disponible
        driverProfile.isAvailable = false;
        await driverProfile.save();

        return res.json(ride);
    } catch (error) {
        console.error("❌ [acceptRide] Error:", error);
        return res.status(500).json({ message: "Error al aceptar el viaje" });
    }
};

/* =========================================================
   OBTENER ESTADO DE VIAJE
   ========================================================= */

export const getRideStatus: RequestHandler = async (req, res) => {
    try {
        const { rideId } = req.params;
        const ride = await RideRequestModel.findById(rideId)
            .populate("customerId", "name email")
            .populate("driverId", "name email")
            .populate("vehicleId");

        if (!ride) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }

        return res.json(ride);
    } catch (error) {
        console.error("❌ [getRideStatus] Error:", error);
        return res.status(500).json({ message: "Error al obtener estado del viaje" });
    }
};

/* =========================================================
   ACTUALIZAR ESTADO (CONDUCTOR)
   ========================================================= */

export const updateRideStatus: RequestHandler = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { status } = req.body;

        if (!Object.values(RideStatus).includes(status)) {
            return res.status(400).json({ message: "Estado de viaje inválido" });
        }

        const ride = await RideRequestModel.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Viaje no encontrado" });

        ride.status = status;

        if (status === RideStatus.IN_PROGRESS) ride.startedAt = new Date();
        if (status === RideStatus.COMPLETED) {
            ride.completedAt = new Date();
            // Volver a poner al conductor disponible
            await DriverProfileModel.findOneAndUpdate(
                { userId: ride.driverId },
                { isAvailable: true }
            );
        }

        await ride.save();
        return res.json(ride);
    } catch (error) {
        console.error("❌ [updateRideStatus] Error:", error);
        return res.status(500).json({ message: "Error al actualizar estado" });
    }
};
