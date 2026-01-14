import { RequestHandler } from "express";
import { TicketModel } from "../models/ticket.model.js";
import { TripModel } from "../models/trip.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= COMPRAR TIQUETE ================= */

export const buyTicket: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        message: "tripId es obligatorio",
      });
    }

    /* ================= TRIP + ROUTE + COMPANY ================= */

    const trip = await TripModel.findById(tripId).populate({
      path: "route",
      populate: { path: "company" },
    });

    if (!trip || !trip.route) {
      return res.status(404).json({
        message: "Viaje no encontrado",
      });
    }

    /* 🔒 BLOQUEO POR ESTADO DEL VIAJE */
    if (!trip.active) {
      return res.status(403).json({
        message:
          "Este viaje no está disponible actualmente",
      });
    }

    const route: any = trip.route;

    /* 🔒 BLOQUEO POR ESTADO DE LA RUTA */
    if (!route.active) {
      return res.status(403).json({
        message:
          "Esta ruta se encuentra desactivada",
      });
    }

    const companyId =
      typeof route.company === "object"
        ? route.company._id
        : route.company;

    /* ================= CREATE TICKET ================= */

    const ticket = await TicketModel.create({
      user: authReq.user.id,
      trip: trip._id,
      company: companyId,
      routeName: `${route.origin} → ${route.destination}`,
      transport: "lancha",
      price: trip.price,
      code: Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(),
      status: 'valid' // Por defecto
    });

    /* ================= UPDATE COMPANY BALANCE ================= */

    await CompanyModel.findByIdAndUpdate(companyId, {
      $inc: { balance: trip.price },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Error buyTicket:", error);
    return res.status(500).json({
      message: "Error al comprar el tiquete",
    });
  }
};

/* ================= HISTORIAL DEL USUARIO ================= */

export const getMyTickets: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const tickets = await TicketModel.find({
      user: authReq.user.id,
    })
      .populate({
        path: "trip",
        populate: {
          path: "route",
          populate: { path: "company" },
        },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    return res.status(500).json({
      message: "Error al obtener historial",
    });
  }
};

/* ================= VALIDAR TICKET (OWNER/ADMIN) ================= */

export const validateTicket: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) return res.status(400).json({ message: "Falta código" });

    // Buscar ticket por código (ignorando mayúsculas)
    const ticket = await TicketModel.findOne({ 
        code: code.toUpperCase() 
    }).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ 
          valid: false, 
          message: "Ticket NO encontrado" 
      });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ 
          valid: false, 
          message: "Este ticket YA fue utilizado",
          usedAt: ticket.updatedAt
      });
    }

    if (ticket.status === 'cancelled') {
        return res.status(400).json({ 
            valid: false, 
            message: "Ticket Cancelado" 
        });
    }

    // Marcar como usado
    ticket.status = 'used';
    await ticket.save();

    return res.json({ 
        valid: true, 
        message: "Ticket Válido ✅", 
        passenger: (ticket.user as any)?.name || "Pasajero",
        routeName: ticket.routeName
    });

  } catch (error) {
    console.error("❌ Error validateTicket:", error);
    return res.status(500).json({ message: "Error al validar ticket" });
  }
};
