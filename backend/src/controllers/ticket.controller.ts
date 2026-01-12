import { RequestHandler } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { PaymentService } from "../services/payment.service.js";
import { wompiConfig } from "../config/wompi.js";

/* =========================================================
   COMPRAR TICKET (INICIAR PAGO)
   ========================================================= */

/**
 * buyTicket
 *
 * Responsabilidad:
 * - Validar usuario
 * - Validar viaje
 * - Calcular valores financieros
 * - Crear ticket en estado PENDING
 * - Retornar datos necesarios para el widget de Wompi
 *
 * ⚠️ IMPORTANTE:
 * - NO activa el ticket
 * - NO confirma el pago
 * - El webhook es el ÚNICO que activa el ticket
 */
export const buyTicket: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    /* =========================
       1. VALIDAR AUTENTICACIÓN
       ========================= */
    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { tripId, passengerName, passengerId, seatNumber } = req.body;

    if (!tripId || !passengerName || !passengerId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    /* =========================
       2. VALIDAR VIAJE
       ========================= */
    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (!trip.active) {
      return res
        .status(400)
        .json({ message: "Viaje inactivo o cancelado" });
    }

    /* =========================
       3. CALCULAR FINANZAS
       ========================= */

    const price = trip.price;

    // Toda la lógica financiera vive en PaymentService
    const split = PaymentService.calculateSplit(price);

    /* =========================
       4. GENERAR REFERENCIA WOMPI
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

    /* =========================
       5. CREAR TICKET (PENDING)
       ========================= */

    /**
     * ⚠️ PUNTOS CRÍTICOS:
     * - status: pending_payment
     * - payment SIEMPRE existe
     * - passenger usa authReq.user.id (NO _id)
     */
    const ticket = await TicketModel.create({
      trip: trip._id,
      passenger: authReq.user.id,
      passengerName,
      passengerId,
      seatNumber,

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
       6. RESPUESTA AL FRONTEND
       ========================= */

    /**
     * El frontend SOLO necesita esto:
     * - Datos del widget
     * - Nada más
     */
    return res.status(201).json({
      ticketId: ticket._id.toString(),
      paymentData: {
        publicKey: wompiConfig.publicKey,
        reference,
        amountInCents,
        currency,
        signature: integritySignature,
        redirectUrl: `${wompiConfig.apiUrl}/transactions`,
        customerEmail: authReq.user.email,
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
   OBTENER TICKETS DEL USUARIO
   ========================================================= */

/**
 * getMyTickets
 *
 * Devuelve los tickets del usuario autenticado.
 *
 * ⚠️ No muestra tickets pendientes por defecto
 */
export const getMyTickets: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const tickets = await TicketModel.find({
      passenger: authReq.user.id,
      status: { $ne: "pending_payment" },
    })
      .populate({
        path: "trip",
        populate: { path: "route" },
      })
      .sort({ createdAt: -1 });

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    return res.status(500).json({
      message: "Error al obtener tickets",
    });
  }
};

/* =========================================================
   VALIDAR TICKET (EMPRESA)
   ========================================================= */

/**
 * validateTicket
 *
 * ⚠️ Este endpoint debe:
 * - Leer QR
 * - Validar que el ticket esté ACTIVE
 * - Marcarlo como USED
 *
 * Se implementa después
 */
export const validateTicket: RequestHandler = async (_req, res) => {
  return res
    .status(501)
    .json({ message: "Validación de ticket no implementada" });
};

/* =========================================================
   OBTENER PASAJEROS DE UN VIAJE
   ========================================================= */

export const getPassengersByTrip: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const tickets = await TicketModel.find({
      trip: tripId,
      status: { $in: ["active", "used"] },
    });

    return res.json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener pasajeros",
    });
  }
};

/* =========================================================
   REGISTRO MANUAL DE PASAJERO
   ========================================================= */

/**
 * registerManualPassenger
 *
 * Caso:
 * - Venta en efectivo
 * - No pasa por Wompi
 *
 * ⚠️ El ticket nace ACTIVE
 */
export const registerManualPassenger: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { tripId, passengerName, passengerId, seatNumber, price } = req.body;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const finalPrice = price ?? trip.price;

    const ticket = await TicketModel.create({
      trip: tripId,
      passenger: authReq.user.id, // ❌ antes _id → error
      passengerName,
      passengerId,
      seatNumber,

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
    console.error(error);
    return res.status(500).json({
      message: "Error al registrar pasajero",
    });
  }
};
