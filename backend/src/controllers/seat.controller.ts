import { Request, Response } from "express";
import mongoose from "mongoose";

import { TripModel } from "../models/trip.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";
import { verifyTurnstile } from '../lib/turnstitle.js';

console.log(
  await verifyTurnstile('token_falso')
);
/* =========================================================
   GET /api/trips/:tripId/seats
   ---------------------------------------------------------
   Devuelve el mapa de asientos del viaje.

   REGLA CLAVE:
   - Si existe un documento en SeatReservation → ocupado
   - NO usamos status
   ========================================================= */
export const getTripSeats = async (req: Request, res: Response) => {
  const { tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ message: "ID de viaje inválido" });
  }

  /* 1️⃣ Validar viaje */
  const trip = await TripModel.findById(tripId).lean();
  if (!trip) {
    return res.status(404).json({ message: "Viaje no encontrado" });
  }

  /* 2️⃣ Asientos ocupados (documento existente = ocupado) */
  const reservations = await SeatReservationModel.find({
    tripId,
  }).select("seatNumber");

  const takenSeats = new Set(reservations.map(r => r.seatNumber));

  /* 3️⃣ Construir mapa completo */
  const seats = Array.from({ length: trip.capacity }, (_, i) => {
    const seatNumber = i + 1;
    return {
      seatNumber,
      available: !takenSeats.has(seatNumber),
    };
  });

  return res.json(seats);
};

/* =========================================================
   POST /api/seats/reserve
   ---------------------------------------------------------
   Bloquea un asiento temporalmente (TTL).

   REGLAS:
   - Un usuario solo puede tener 1 asiento bloqueado
   - Índice UNIQUE evita doble bloqueo
   ========================================================= */
export const reserveSeatHandler = async (req: Request, res: Response) => {
  try {
    // 🔥 LIMPIAR RESERVAS EXPIRADAS
    await SeatReservationModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    const { tripId, seatNumber } = req.body;
    const userId = req.user?.id;

    if (!tripId || seatNumber === undefined || !userId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    /* 1️⃣ Anti-abuso: un asiento por usuario */
    const alreadyBlocked = await SeatReservationModel.findOne({ userId });
    if (alreadyBlocked) {
      return res.status(409).json({
        message: "Ya tienes un asiento bloqueado",
      });
    }

    /* 2️⃣ Crear bloqueo con TTL */
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await SeatReservationModel.create({
      tripId,
      seatNumber,
      userId,
      expiresAt,
    });

    return res.status(201).json({ blocked: true, expiresAt });
  } catch (error: any) {
    // Índice UNIQUE (tripId + seatNumber)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Asiento no disponible",
      });
    }

    console.error("❌ reserveSeatHandler:", error);
    return res.status(500).json({
      message: "Error reservando asiento",
    });
  }
};

/* =========================================================
   POST /api/seats/confirm
   ---------------------------------------------------------
   Confirma el asiento tras pago exitoso.

   EFECTO:
   - Se elimina el bloqueo
   - El Ticket pasa a ser la fuente de verdad
   ========================================================= */
export const confirmSeatHandler = async (req: Request, res: Response) => {
  try {
    const { tripId, seatNumber } = req.body;
    const userId = req.user?.id;

    if (!tripId || seatNumber === undefined || !userId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const reservation = await SeatReservationModel.findOne({
      tripId,
      seatNumber,
      userId,
    });

    if (!reservation) {
      return res.status(409).json({
        message: "El asiento no está bloqueado",
      });
    }

    await SeatReservationModel.deleteOne({ _id: reservation._id });

    return res.json({ confirmed: true });
  } catch (error) {
    console.error("❌ confirmSeatHandler:", error);
    return res.status(500).json({
      message: "Error confirmando asiento",
    });
  }
};

/* =========================================================
   POST /api/seats/release
   ---------------------------------------------------------
   Libera manualmente un asiento bloqueado.
   Usado cuando:
   - Usuario cancela
   - goBack
   - logout
   - app background
   ========================================================= */
export const releaseSeatHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  const { tripId, seatNumber } = req.body;

  if (!tripId || seatNumber === undefined) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  await SeatReservationModel.deleteOne({
    tripId,
    seatNumber,
    userId: req.user.id,
  });

  return res.json({ released: true });
};
