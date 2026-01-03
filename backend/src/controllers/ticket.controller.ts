import { Request, Response } from "express";
import Ticket from "../models/Ticket.js";

/* ================= COMPRAR TIQUETE ================= */

export const buyTicket = async (
  req: Request,
  res: Response
) => {
  try {
    const { routeName, price } = req.body;

    // 🔒 Validación de payload
    if (!routeName || !price) {
      return res.status(400).json({
        message: "routeName y price son obligatorios",
      });
    }

    // 🔒 Validación de auth
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      routeName,
      price,
      code: Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(),
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Error buyTicket:", error);
    res.status(500).json({
      message: "Error al comprar el tiquete",
    });
  }
};

/* ================= HISTORIAL ================= */

export const getMyTickets = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const tickets = await Ticket.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(tickets);
  } catch (error) {
    console.error("❌ Error getMyTickets:", error);
    res.status(500).json({
      message: "Error al obtener historial",
    });
  }
};
