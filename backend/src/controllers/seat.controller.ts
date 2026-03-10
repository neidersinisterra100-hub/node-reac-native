import { Request, Response } from "express";
import mongoose from "mongoose";

import { TripModel } from "../models/trip.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";
import { TicketModel } from "../models/ticket.model.js";

/* =========================================================
   MEMORIA MUTEX (CONCURRENCY LOCKS)
   =========================================================
   Previene el fenómeno Node.js Race Condition donde dos
   solicitudes concurrentes disparan operaciones a MongoDB 
   antes de que la primera termine de construir el índice.
   ========================================================= */
const MUTEX_LOCKS = new Map<string, boolean>();

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

    /* 2️⃣ Obtener reservas temporales y tickets (comprados y reservados) */
    const [reservations, soldTickets, reservedTickets] = await Promise.all([
      SeatReservationModel.find({ tripId, expiresAt: { $gt: new Date() } }).lean(),
      TicketModel.find({
        trip: tripId,
        status: { $in: ["active", "used", "pending_payment"] }
      }).select("seatNumber").lean(),
      TicketModel.find({
        trip: tripId,
        status: "reserved"
      }).select("seatNumber").lean()
    ]);

    // Asientos ocupados por tickets (BLOQUEO REAL)
    const soldSeatNumbers = new Set(soldTickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n)));

    // Asientos reservados para pagar al abordar
    const reservedSeatNumbers = new Set(reservedTickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n)));

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
      const isReservedByMe = (reserversId && userId) ? reserversId === userId : false;
      const isLockedByOther = !!reserversId && !isReservedByMe;
      const isPayOnBoarding = reservedSeatNumbers.has(seatNumber);

      return {
        seatNumber,
        // Si el ticket está vendido -> ocupado (false)
        // Si está reservado para pagar al abordar -> disponible (true) para sobreescritura, pero advertido
        // Si está reservado temporalmente por OTRO -> ocupado (false)
        // Si está libre o reservado por MÍ -> disponible (true)
        available: !isSold && !isLockedByOther,
        isReservedByMe,
        isSold,
        isLockedByOther,
        isPayOnBoarding
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
    const { tripId, seatNumber, seatNumbers, seats } = req.body;
    const userId = req.user?.id;

    if (!tripId || !userId) {
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

    let finalSeats = Array.isArray(seatNumbers)
      ? seatNumbers.map(Number)
      : (seatNumber !== undefined ? [Number(seatNumber)] : []);

    // AUTO-ASSIGN SEATS if count is provided but no specific numbers
    if (finalSeats.length === 0 && seats && Number(seats) > 0) {
      const seatsCount = Number(seats);

      const [reservations, tickets] = await Promise.all([
        SeatReservationModel.find({ tripId, expiresAt: { $gt: new Date() } }).select("seatNumber").lean(),
        TicketModel.find({
          trip: tripId,
          status: { $in: ["active", "used", "pending_payment", "reserved"] },
        }).select("seatNumber").lean(),
      ]);

      const occupied = new Set([
        ...reservations.map(r => Number(r.seatNumber)),
        ...tickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n))
      ]);

      const availableSeats: number[] = [];
      for (let i = 1; i <= trip.capacity; i++) {
        if (!occupied.has(i)) {
          availableSeats.push(i);
        }
        if (availableSeats.length === seatsCount) break;
      }

      if (availableSeats.length < seatsCount) {
        return res.status(400).json({
          message: "No hay suficientes asientos disponibles para la cantidad solicitada",
        });
      }
      finalSeats = availableSeats;
    }

    if (finalSeats.length === 0) {
      return res.status(400).json({ message: "Debe especificar asientos o cantidad" });
    }

    const [reservations, tickets] = await Promise.all([
      SeatReservationModel.find({ tripId, expiresAt: { $gt: new Date() } }).select("seatNumber").lean(),
      TicketModel.find({
        trip: tripId,
        status: { $in: ["active", "used", "pending_payment", "reserved"] },
      }).select("seatNumber").lean(),
    ]);

    const occupiedCount = new Set([
      ...reservations.map(r => Number(r.seatNumber)),
      ...tickets.map(t => Number(t.seatNumber)).filter(n => !isNaN(n))
    ]).size + tickets.filter(t => t.seatNumber === undefined || t.seatNumber === null).length;

    // Verificar si caben TODOS los asientos nuevos
    if (occupiedCount + finalSeats.length > trip.capacity && !seats) {
      // Only check strictly if not auto-assigned (auto-assign already checked availability)
    }

    /* 1️⃣ Bloqueo atómico estricto */
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    console.log(`[RESERVE SEAT] START -> User: ${userId}, Seats: ${finalSeats}, ExpiresAt: ${expiresAt}`);

    const now = new Date();

    const reservationPromises = finalSeats.map(async (sn) => {
      const mutexKey = `${tripId}_${sn}`;

      // Mutex in-memory (Casi instantáneo, previene ráfagas de Milisegundos JS)
      if (MUTEX_LOCKS.get(mutexKey)) {
        console.log(`[MUTEX REJECTED] Seat ${sn} is actively being processed by another thread`);
        return null;
      }
      MUTEX_LOCKS.set(mutexKey, true);

      try {
        // En lugar de depender de índices únicos de Mongo que pueden fallar, 
        // verificamos manualmente la base de datos de manera explícita:
        const existingLock = await SeatReservationModel.findOne({ tripId, seatNumber: sn });

        if (existingLock) {
          // Si el asiento ya existe en la DB
          const isMine = existingLock.userId.toString() === userId.toString();
          const isExpired = existingLock.expiresAt < now;

          if (isMine || isExpired) {
            // Es mío o ya expiró -> Lo tomo / Extiendo el tiempo
            existingLock.userId = new mongoose.Types.ObjectId(userId) as any;
            existingLock.expiresAt = expiresAt;
            await existingLock.save();
            return existingLock;
          } else {
            // NO es mío y NO ha expirado -> ESTÁ TOMADO POR OTRO. Rechazar inmediatamente.
            console.log(`[RESERVE SEAT] Seat ${sn} is TAKEN by ${existingLock.userId} until ${existingLock.expiresAt}`);
            throw new Error("TAKEN_BY_OTHER");
          }
        } else {
          // Si no existe, lo creamos limpio
          return await SeatReservationModel.create({
            tripId,
            seatNumber: sn,
            userId,
            expiresAt
          });
        }
      } catch (err: any) {
        if (err.message === "TAKEN_BY_OTHER" || err.code === 11000) {
          return null; // Falló porque alguien más nos ganó
        }
        throw err;
      } finally {
        MUTEX_LOCKS.delete(mutexKey); // Liberar Mutex local siempre al final
      }
    });

    const results = await Promise.all(reservationPromises);
    console.log(`[RESERVE SEAT] Results:`, results.map(r => r?._id || "NULL (TAKEN)"));

    // Si alguno retornó null, significa que se encontró con el error 11000 de colisión
    const failed = results.filter(r => r === null);

    if (failed.length > 0) {
      // Hacemos rollback estricto de los que sí logramos pescar en esta bolsa
      await SeatReservationModel.deleteMany({
        tripId,
        seatNumber: { $in: finalSeats },
        userId
      });
      return res.status(409).json({ message: "Uno o más asientos fueron tomados por otra persona simultáneamente." });
    }

    // Return the assigned seat numbers so the frontend knows which ones were booked
    return res.status(201).json({
      blocked: true,
      expiresAt,
      seatsCount: finalSeats.length,
      seatNumbers: finalSeats
    });

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

  if (!tripId) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  if (finalSeats.length === 0) {
    // 🚀 Limpiar TODAS las reservas del usuario en este viaje
    await SeatReservationModel.deleteMany({
      tripId,
      userId: req.user.id,
    });
  } else {
    // 🚀 Limpiar asientos específicos
    await SeatReservationModel.deleteMany({
      tripId,
      seatNumber: { $in: finalSeats },
      userId: req.user.id,
    });
  }

  return res.json({ released: true });
};

/* =========================================================
   POST /api/seats/clear-trip-locks
   ---------------------------------------------------------
   [ADMIN] Libera TODOS los asientos temporalmente bloqueados en un viaje.
   ========================================================= */
export const clearTripLocksHandler = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: "ID de viaje requerido" });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    // 🚀 Limpiar TODAS las reservas de TODOS los usuarios en este viaje
    const result = await SeatReservationModel.deleteMany({
      tripId,
    });

    return res.json({
      message: "Asientos liberados exitosamente",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("❌ clearTripLocksHandler:", error);
    return res.status(500).json({
      message: "Error al liberar todos los asientos del viaje",
    });
  }
};
