import { RequestHandler } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { buildDepartureDate } from "../utils/data.js";

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */
const MAX_PASSENGERS_PER_TRIP = 30;

/* =========================================================
   UTILIDAD: obtener siguiente asiento disponible
   ========================================================= */
async function getNextSeatNumber(
  tripId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
): Promise<number> {
  const lastTicket = await TicketModel.findOne(
    { trip: tripId, seatNumber: { $ne: null } },
    { seatNumber: 1 }
  )
    .sort({ seatNumber: -1 })
    .session(session);

  const nextSeat = (lastTicket?.seatNumber ?? 0) + 1;

  if (nextSeat > MAX_PASSENGERS_PER_TRIP) {
    throw new Error("CAPACITY_FULL");
  }

  return nextSeat;
}

/* =========================================================
   COMPRAR TIQUETE (APP)
   ========================================================= */
export const buyTicket: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { tripId } = req.body;
    if (!tripId) {
      return res.status(400).json({ message: "tripId es obligatorio" });
    }

    const trip = await TripModel.findById(tripId)
      .populate({ path: "route", populate: { path: "company" } })
      .session(session);

    if (!trip || !trip.route || !trip.active) {
      return res.status(403).json({ message: "Viaje no disponible" });
    }

    const route: any = trip.route;
    if (!route.active) {
      return res.status(403).json({ message: "Ruta desactivada" });
    }

    const existingTicket = await TicketModel.findOne({
      user: authReq.user.id,
      trip: trip._id,
      status: { $in: ["valid", "used"] },
    }).session(session);

    if (existingTicket) {
      return res.status(409).json({
        message: "Ya tienes un ticket para este viaje",
      });
    }

    let seatNumber: number;
    try {
      seatNumber = await getNextSeatNumber(trip._id, session);
    } catch {
      return res.status(409).json({
        message: "Capacidad completa (30 pasajeros)",
      });
    }

    const companyId =
      typeof route.company === "object"
        ? route.company._id
        : route.company;

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const departureAt = buildDepartureDate(trip.date, trip.departureTime);

    const [ticket] = await TicketModel.create(
      [
        {
          user: authReq.user.id,
          trip: trip._id,
          company: companyId,
          routeName: `${route.origin} → ${route.destination}`,
          transport: "lancha",
          price: trip.price,
          code,
          seatNumber,
          departureAt,
          expiresAt: departureAt,
        },
      ],
      { session }
    );

    await CompanyModel.findByIdAndUpdate(
      companyId,
      { $inc: { balance: trip.price } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(ticket);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ buyTicket:", error);
    return res.status(500).json({ message: "Error al comprar ticket" });
  }
};

/* =========================================================
   HISTORIAL DE TICKETS DEL USUARIO
   ========================================================= */
export const getMyTickets: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const tickets = await TicketModel.find(
      { user: authReq.user.id },
      {
        routeName: 1,
        price: 1,
        transport: 1,
        status: 1,
        departureAt: 1,
        code: 1,
        seatNumber: 1,
        user: 1,
      }
    )
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    return res.status(500).json({ message: "Error al obtener historial" });
  }
};

/* =========================================================
   PASAJEROS POR VIAJE (OWNER / ADMIN)
   ========================================================= */
export const getPassengersByTrip: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    const passengers = await TicketModel.find(
      { trip: tripId },
      {
        seatNumber: 1,
        routeName: 1,
        status: 1,
        user: 1,
      }
    )
      .populate("user", "name")
      .sort({ seatNumber: 1 });

    return res.json(passengers);
  } catch (error) {
    console.error("❌ getPassengersByTrip:", error);
    return res.status(500).json({
      message: "Error al obtener pasajeros",
    });
  }
};

/* =========================================================
   REGISTRO MANUAL DE PASAJERO (OWNER / ADMIN)
   ========================================================= */
export const registerManualPassenger: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { role, companyId, id: userId } = authReq.user;

    if (!["owner", "admin"].includes(role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        message: "tripId es obligatorio",
      });
    }

    const trip = await TripModel.findById(tripId)
      .populate({
        path: "route",
        select: "origin destination",
      })
      .populate("company")
      .session(session);


    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const company: any = trip.company;

    if (role === "admin" && companyId !== company._id.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (role === "owner" && company.owner.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    let seatNumber: number;
    try {
      seatNumber = await getNextSeatNumber(trip._id, session);
    } catch {
      return res.status(409).json({
        message: "Capacidad completa (30 pasajeros)",
      });
    }

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const departureAt = buildDepartureDate(trip.date, trip.departureTime);
    const route: any = trip.route;

    /* =====================================================
          CREAR TICKET MANUAL
   ===================================================== */
   
    const [ticket] = await TicketModel.create(
      [
        {
          user: authReq.user.id,
          trip: trip._id,
          company: company._id,
          routeName: `${route.origin} → ${route.destination}`,
          transport: trip.transportType,
          price: 0,
          code,
          seatNumber,
          departureAt,
          expiresAt: departureAt,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(ticket);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ registerManualPassenger:", error);
    return res.status(500).json({
      message: "Error registrando pasajero",
    });
  }
};

/* =========================================================
   VALIDAR TICKET (OWNER / ADMIN)
   ========================================================= */
export const validateTicket: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.user.companyId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Código requerido" });
    }

    const ticket = await TicketModel.findOne({
      code: code.toUpperCase(),
      company: authReq.user.companyId,
    }).populate("user", "name");

    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: "Ticket no encontrado",
      });
    }

    if (ticket.expiresAt < new Date()) {
      ticket.status = "expired";
      await ticket.save();
      return res.status(400).json({
        valid: false,
        message: "Ticket expirado",
      });
    }

    if (ticket.status === "used") {
      return res.status(400).json({
        valid: false,
        message: "Ticket ya utilizado",
        seatNumber: ticket.seatNumber,
      });
    }

    ticket.status = "used";
    ticket.usedAt = new Date();
    await ticket.save();

    return res.json({
      valid: true,
      passenger: (ticket.user as any)?.name ?? "Pasajero",
      seatNumber: ticket.seatNumber,
      routeName: ticket.routeName,
    });
  } catch (error) {
    console.error("❌ validateTicket:", error);
    return res.status(500).json({ message: "Error al validar ticket" });
  }
};
