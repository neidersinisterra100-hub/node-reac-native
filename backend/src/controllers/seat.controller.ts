import { Request, Response } from "express";
import mongoose from "mongoose";

import { TripModel } from "../models/trip.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";
import { TicketModel } from "../models/ticket.model.js";

/**
 * getTripSeats
 * ---------------------------------------------------------
 * Devuelve el mapa de asientos del viaje.
 *
 * 🚀 MEJORA:
 * - Identifica si la reserva pertenece al usuario actual.
 * - Si es del usuario, disponible = true (vuelve a ser interactuable).
 */
export const getTripSeats = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    /* 1️⃣ Validar viaje */
    const trip = await TripModel.findById(tripId).lean();
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    /* 2️⃣ Obtener reservas y tickets vendidos */
    const [reservations, soldTickets] = await Promise.all([
      SeatReservationModel.find({ tripId }).lean(),
      TicketModel.find({
        trip: tripId,
        status: { $in: ["active", "used", "pending_payment"] }
      }).select("seatNumber").lean()
    ]);

    // Asientos ocupados por tickets (BLOQUEO REAL)
    const soldSeatNumbers = new Set(soldTickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n)));

    // Mapear reservas para identificar al dueño
    const reservationMap = new Map();
    reservations.forEach(r => {
      reservationMap.set(Number(r.seatNumber), r.userId.toString());
    });

    /* 3️⃣ Construir mapa completo */
    const seats = Array.from({ length: trip.capacity }, (_, i) => {
      const seatNumber = i + 1;

      const reserversId = reservationMap.get(seatNumber);
      const isSold = soldSeatNumbers.has(seatNumber);
      const isReservedByMe = reserversId === userId;

      return {
        seatNumber,
        // Si el ticket está vendido -> ocupado (false)
        // Si está reservado por OTRO -> ocupado (false)
        // Si está libre o reservado por MÍ -> disponible (true)
        available: !isSold && (!reserversId || isReservedByMe),
        isReservedByMe: isReservedByMe
      };
    });

    return res.json(seats);
  } catch (error) {
    console.error("❌ Error getTripSeats:", error);
    return res.status(500).json({ message: "Error al obtener asientos" });
  }
};

/* =========================================================
   POST /api/seats/reserve
   ---------------------------------------------------------
   Bloquea un asiento temporalmente (TTL).
   ========================================================= */
export const reserveSeatHandler = async (req: Request, res: Response) => {
  try {
    // 🔥 LIMPIAR RESERVAS EXPIRADAS
    await SeatReservationModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    const { tripId, seatNumber, seatNumbers } = req.body;
    const userId = req.user?.id;

    const finalSeats = Array.isArray(seatNumbers)
      ? seatNumbers.map(Number)
      : (seatNumber !== undefined ? [Number(seatNumber)] : []);

    if (!tripId || finalSeats.length === 0 || !userId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    /* 0️⃣ Validar Capacidad Total */
    const trip = await TripModel.findById(tripId).select("capacity").lean();
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const [reservations, tickets] = await Promise.all([
      SeatReservationModel.find({ tripId }).select("seatNumber").lean(),
      TicketModel.find({
        trip: tripId,
        status: { $in: ["active", "used", "pending_payment"] },
      }).select("seatNumber").lean(),
    ]);

    const occupiedCount = new Set([
      ...reservations.map(r => Number(r.seatNumber)),
      ...tickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n))
    ]).size + tickets.filter(t => t.seatNumber === undefined || t.seatNumber === null).length;

    // Verificar si caben TODOS los asientos nuevos
    if (occupiedCount + finalSeats.length > trip.capacity) {
      return res.status(400).json({
        message: "No hay suficiente cupo para todos los asientos seleccionados",
      });
    }

    /* 1️⃣ Bloqueo (Índice único en DB protege contra duplicados) */
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const reservationPromises = finalSeats.map(sn =>
      SeatReservationModel.findOneAndUpdate(
        { tripId, seatNumber: sn },
        { userId, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    await Promise.all(reservationPromises);

    return res.status(201).json({ blocked: true, expiresAt, seatsCount: finalSeats.length });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Uno o más asientos ya no están disponibles",
      });
    }

    console.error("❌ reserveSeatHandler:", error);
    return res.status(500).json({
      message: "Error reservando asientos",
    });
  }
};

/* =========================================================
   POST /api/seats/confirm
   ---------------------------------------------------------
   Confirma el asiento tras pago exitoso.
   ========================================================= */
export const confirmSeatHandler = async (req: Request, res: Response) => {
  try {
    const { tripId, seatNumber, seatNumbers } = req.body;
    const userId = req.user?.id;

    const finalSeats = Array.isArray(seatNumbers)
      ? seatNumbers.map(Number)
      : (seatNumber !== undefined ? [Number(seatNumber)] : []);

    if (!tripId || finalSeats.length === 0 || !userId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    await SeatReservationModel.deleteMany({
      tripId,
      seatNumber: { $in: finalSeats },
      userId,
    });

    return res.json({ confirmed: true });
  } catch (error) {
    console.error("❌ confirmSeatHandler:", error);
    return res.status(500).json({
      message: "Error confirmando asientos",
    });
  }
};

/* =========================================================
   POST /api/seats/release
   ---------------------------------------------------------
   Libera manualmente un asiento bloqueado.
   ========================================================= */
export const releaseSeatHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  const { tripId, seatNumber, seatNumbers } = req.body;

  const finalSeats = Array.isArray(seatNumbers)
    ? seatNumbers.map(Number)
    : (seatNumber !== undefined ? [Number(seatNumber)] : []);

  if (!tripId || finalSeats.length === 0) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  await SeatReservationModel.deleteMany({
    tripId,
    seatNumber: { $in: finalSeats },
    userId: req.user.id,
  });

  return res.json({ released: true });
};
