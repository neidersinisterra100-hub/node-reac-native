import { RequestHandler } from "express";
import mongoose from "mongoose";

/* =========================================================
   MODELOS
   ========================================================= */
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";
import { UserModel } from "../models/user.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";

/* =========================================================
   SERVICIOS
   ========================================================= */
import { PaymentService } from "../services/payment.service.js";
import { wompiConfig } from "../config/wompi.js";

/* =========================================================
   COMPRAR TICKET (INICIAR PAGO)
   ========================================================= */
/**
 * POST /api/tickets/buy
 *
 * Reglas CLAVE:
 * - SOLO role "user"
 * - El asiento DEBE estar bloqueado por ese usuario
 * - El ticket queda en PENDING_PAYMENT
 * - El asiento se libera SOLO cuando el pago se confirme
 */
export const buyTicket: RequestHandler = async (req, res) => {
  try {
    /* =========================
       1. AUTH + ROL
       ========================= */
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userId = currentUser.id;

    if (currentUser.role !== "user") {
      return res.status(403).json({
        message: "Solo usuarios pueden comprar tickets",
      });
    }

    const { tripId, passengerName, passengerId, seatNumber, seatNumbers } = req.body;

    // Normalizar a array de asientos
    const finalSeats = Array.isArray(seatNumbers)
      ? seatNumbers
      : (seatNumber !== undefined ? [seatNumber] : []);

    if (!tripId || !passengerName || !passengerId || finalSeats.length === 0) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    /* =========================
       2. VALIDAR VIAJE
       ========================= */
    const trip = await TripModel.findById(tripId)
      .populate("routeId")
      .lean();

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (!trip.isActive) {
      return res.status(400).json({
        message: "Viaje inactivo o cancelado",
      });
    }

    const route: any = trip.routeId;

    if (!route?.departmentId || !route?.municipioId || !route?.cityId) {
      return res.status(400).json({
        message: "El viaje no tiene ubicación completa",
      });
    }

    /* =========================
       3. VALIDAR ASIENTOS BLOQUEADOS
       =========================
       🔒 TODOS los asientos DEBEN estar bloqueados
       🔒 Y deben pertenecer al usuario
    */
    const blockedCount = await SeatReservationModel.countDocuments({
      tripId,
      seatNumber: { $in: finalSeats },
      userId: currentUser.id,
    });

    if (blockedCount !== finalSeats.length) {
      return res.status(409).json({
        message: "Uno o más asientos no están bloqueados por este usuario o ya expiraron",
      });
    }

    /* =========================
       4. EMAIL REAL DEL USUARIO
       ========================= */
    const user = await UserModel.findById(currentUser.id)
      .select("email")
      .lean<{ email: string }>();

    if (!user?.email) {
      return res.status(400).json({
        message: "Usuario sin email válido",
      });
    }

    /* =========================
       5. CÁLCULO FINANCIERO TOTAL
       ========================= */
    const unitPrice = trip.price;
    const totalPrice = unitPrice * finalSeats.length;

    // Generamos la referencia única para TODO el grupo de tickets
    const reference = PaymentService.generatePaymentReference();
    const amountInCents = totalPrice * 100;
    const currency = "COP";

    const integritySignature =
      PaymentService.generateIntegritySignature(
        reference,
        amountInCents,
        currency
      );

    const redirectUrl = process.env.PAYMENT_REDIRECT_URL;
    if (!redirectUrl) {
      throw new Error("PAYMENT_REDIRECT_URL no configurado");
    }

    /* =========================
       6. CREAR TICKETS (PENDING)
       ========================= */
    // Calculamos el split para cada ticket individual (para reportes)
    const unitSplit = PaymentService.calculateSplit(unitPrice);

    const ticketPromises = finalSeats.map(sn => {
      return TicketModel.create({
        trip: trip._id,
        passenger: userId,
        passengerName,
        passengerId,
        seatNumber: String(sn),

        departmentId: route.departmentId,
        municipioId: route.municipioId,
        cityId: route.cityId,

        status: "pending_payment",
        financials: { ...unitSplit },
        payment: {
          status: "PENDING",
          reference,
          paymentMethod: "WOMPI",
        },
      });
    });

    const tickets = await Promise.all(ticketPromises);

    /* =========================
       7. RESPUESTA (DATOS PAGO)
       ========================= */
    return res.status(201).json({
      message: "Pago iniciado",
      ticketsCount: tickets.length,
      paymentData: {
        publicKey: wompiConfig.publicKey,
        currency,
        amountInCents,
        reference,
        signature: integritySignature,
        customerEmail: user.email,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("❌ buyTicket:", error);
    return res.status(500).json({
      message: "Error al procesar la compra",
    });
  }
};

/* =========================================================
   HISTORIAL DEL USUARIO
   ========================================================= */
/**
 * GET /api/tickets/my
 * - SOLO role "user"
 */
export const getMyTickets: RequestHandler = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    /* Eliminamos la restricción de rol "user" para que admin/owner también puedan ver sus tickets */

    const tickets = await TicketModel.find({
      passenger: currentUser.id,
      status: { $ne: "pending_payment" },
    })
      .populate({
        path: "trip",
        populate: { path: "routeId" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    return res.status(500).json({
      message: "Error al obtener tickets",
    });
  }
};

/* =========================================================
   VALIDAR TICKET (CHECK-IN)
   ========================================================= */
export const validateTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: "ID de ticket requerido" });
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: "ID de ticket inválido" });
    }

    /* 1. Buscar el ticket */
    const ticket = await TicketModel.findById(ticketId).populate({
      path: "trip",
      populate: { path: "routeId" }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    /* 2. Validar estado actual */
    if (ticket.status === "used") {
      return res.status(400).json({
        message: "Este ticket ya ha sido validado anteriormente",
        validatedAt: ticket.updatedAt
      });
    }

    if (ticket.status !== "active") {
      return res.status(400).json({
        message: `El ticket no puede ser validado porque su estado es: ${ticket.status}`
      });
    }

    /* 3. Cambiar a usado */
    ticket.status = "used";
    await ticket.save();

    console.log(`✅ Ticket ${ticketId} validado con éxito`);

    return res.json({
      message: "Check-in realizado con éxito",
      ticket
    });
  } catch (error) {
    console.error("❌ Error validateTicket:", error);
    return res.status(500).json({
      message: "Error interno al validar el ticket"
    });
  }
};

/* =========================================================
   PASAJEROS POR VIAJE
   ========================================================= */
export const getPassengersByTrip: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const tickets = await TicketModel.find({
      trip: tripId,
      status: { $in: ["active", "used"] },
    }).lean();

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getPassengersByTrip:", error);
    return res.status(500).json({
      message: "Error al obtener pasajeros",
    });
  }
};

/* =========================================================
   REGISTRO MANUAL DE PASAJERO (CASH)
   ========================================================= */
/**
 * POST /api/tickets/manual
 * - SOLO owner / admin
 */
export const registerManualPassenger: RequestHandler = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userId = currentUser.id;

    const { tripId, passengerName, passengerId, seatNumber, seatNumbers, price } = req.body;

    // Normalizar a array de asientos
    const finalSeats = Array.isArray(seatNumbers)
      ? seatNumbers.map(Number)
      : (seatNumber !== undefined ? [Number(seatNumber)] : []);

    if (!tripId || !passengerName || !passengerId || finalSeats.length === 0) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const trip = await TripModel.findById(tripId)
      .populate("routeId")
      .lean();

    if (!trip || !trip.isActive) {
      return res.status(400).json({
        message: "Viaje inválido o inactivo",
      });
    }

    /* =========================
       VALIDAR CAPACIDAD Y ASIENTOS
       ========================= */
    const [reservations, tickets] = await Promise.all([
      SeatReservationModel.find({ tripId, expiresAt: { $gt: new Date() } }).select("seatNumber userId").lean(),
      TicketModel.find({
        trip: tripId,
        status: { $in: ["active", "used", "pending_payment"] },
      }).select("seatNumber").lean(),
    ]);

    // Ocupación por asientos específicos
    const occupiedSeats = new Set([
      ...reservations
        .filter(r => r.userId.toString() !== currentUser.id) // 🚀 Ignorar si la reserva es del mismo admin
        .map((r) => r.seatNumber),
      ...tickets.map((t) => t.seatNumber).filter(n => n !== undefined && n !== null).map(Number),
    ]);

    // Conteo total (asientos + tickets sin asiento asignado)
    const ticketsWithoutSeatCount = tickets.filter(t => t.seatNumber === undefined || t.seatNumber === null).length;
    const totalOccupied = occupiedSeats.size + ticketsWithoutSeatCount;

    if (totalOccupied + finalSeats.length > trip.capacity) {
      return res.status(400).json({
        message: "El viaje no tiene suficiente cupo para todos los pasajeros",
      });
    }

    // Validar si alguno de los asientos solicitados está ocupado
    for (const sn of finalSeats) {
      if (occupiedSeats.has(sn)) {
        return res.status(409).json({
          message: `El asiento #${sn} ya está ocupado o reservado`,
        });
      }
    }

    const route: any = trip.routeId;
    const finalPrice = price ?? trip.price;

    const ticketPromises = finalSeats.map(sn => {
      return TicketModel.create({
        trip: trip._id,
        passenger: userId,
        passengerName,
        passengerId,
        seatNumber: String(sn),

        departmentId: route.departmentId,
        municipioId: route.municipioId,
        cityId: route.cityId,

        status: "active",

        financials: {
          price: finalPrice,
          platformFee: 0,
          companyNet: finalPrice,
          gatewayFeeEstimated: 0,
        },

        payment: {
          status: "APPROVED",
          paymentMethod: "CASH", // Cash/Manual for development
          paidAt: new Date(),
        },
      });
    });

    const createdTickets = await Promise.all(ticketPromises);

    // Liberar reservas para todos los asientos exitosos
    await SeatReservationModel.deleteMany({
      tripId,
      seatNumber: { $in: finalSeats },
    });

    return res.status(201).json({
      message: "Registro exitoso",
      ticketsCount: createdTickets.length,
      firstTicketId: createdTickets[0]._id
    });
  } catch (error) {
    console.error("❌ Error registerManualPassenger:", error);
    return res.status(500).json({
      message: "Error al registrar pasajero manualmente",
    });
  }
};

/* =========================================================
   OBTENER UN TICKET POR Su ID
   ========================================================= */
export const getTicketById: RequestHandler = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de ticket inválido" });
    }

    const ticket = await TicketModel.findById(id)
      .populate({
        path: "trip",
        populate: { path: "routeId" },
      })
      .lean();

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    // Seguridad opcional: Verificar que el ticket pertenezca al usuario (o sea admin)
    if (currentUser.role === "user" && ticket.passenger.toString() !== currentUser.id) {
      return res.status(403).json({ message: "Acceso denegado a este ticket" });
    }

    return res.json(ticket);
  } catch (error) {
    console.error("❌ Error getTicketById:", error);
    return res.status(500).json({
      message: "Error al obtener ticket",
    });
  }
};
