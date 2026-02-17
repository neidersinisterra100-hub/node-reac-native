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
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Solo usuarios pueden comprar tickets",
      });
    }

    const { tripId, passengerName, passengerId, seatNumber } = req.body;

    if (!tripId || !passengerName || !passengerId || seatNumber === undefined) {
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
       3. VALIDAR ASIENTO BLOQUEADO
       =========================
       🔒 El asiento DEBE estar bloqueado
       🔒 Y debe pertenecer al usuario
    */
    const seatBlocked = await SeatReservationModel.findOne({
      tripId,
      seatNumber,
      userId: req.user.id,
    });

    if (!seatBlocked) {
      return res.status(409).json({
        message: "El asiento no está bloqueado por este usuario",
      });
    }

    /* =========================
       4. EMAIL REAL DEL USUARIO
       ========================= */
    const user = await UserModel.findById(req.user.id)
      .select("email")
      .lean<{ email: string }>();

    if (!user?.email) {
      return res.status(400).json({
        message: "Usuario sin email válido",
      });
    }

    /* =========================
       5. CÁLCULO FINANCIERO
       ========================= */
    const price = trip.price;
    const split = PaymentService.calculateSplit(price);

    /* =========================
       6. CONFIGURACIÓN WOMPI
       ========================= */
    const reference = PaymentService.generatePaymentReference();
    const amountInCents = price * 100;
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
       7. CREAR TICKET (PENDING)
       ========================= */
    const ticket = await TicketModel.create({
      trip: trip._id,
      passenger: req.user.id,
      passengerName,
      passengerId,
      seatNumber,

      departmentId: route.departmentId,
      municipioId: route.municipioId,
      cityId: route.cityId,

      status: "pending_payment",

      financials: {
        price: split.total,
        platformFee: split.platformFee,
        companyNet: split.companyNet,
        gatewayFeeEstimated: split.gatewayFeeEstimated,
      },

      payment: {
        status: "PENDING",
        reference,
      },
    });

    /* =========================
       8. RESPUESTA AL FRONTEND
       ========================= */
    return res.status(201).json({
      ticketId: ticket._id.toString(),
      paymentData: {
        publicKey: wompiConfig.publicKey,
        reference,
        amountInCents,
        currency,
        signature: integritySignature,
        redirectUrl,
        customerEmail: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error buyTicket:", error);
    return res.status(500).json({
      message: "Error al iniciar compra",
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
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Solo usuarios pueden ver este recurso",
      });
    }

    const tickets = await TicketModel.find({
      passenger: req.user.id,
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
export const validateTicket: RequestHandler = async (_req, res) => {
  return res.status(501).json({
    message: "Validación de ticket no implementada",
  });
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
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const {
      tripId,
      passengerName,
      passengerId,
      seatNumber,
      price,
    } = req.body;

    if (!tripId || !passengerName || !passengerId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const trip = await TripModel.findById(tripId)
      .populate("routeId")
      .lean();

    if (!trip || !trip.isActive) {
      return res.status(400).json({
        message: "Viaje inválido o inactivo",
      });
    }

    const route: any = trip.routeId;
    const finalPrice = price ?? trip.price;

    const ticket = await TicketModel.create({
      trip: trip._id,
      passenger: req.user.id,
      passengerName,
      passengerId,
      seatNumber,

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
        paymentMethod: "CASH",
        paidAt: new Date(),
      },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Error registerManualPassenger:", error);
    return res.status(500).json({
      message: "Error al registrar pasajero",
    });
  }
};
