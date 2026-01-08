import { Router } from "express";
import {
  buyTicket,
  getMyTickets,
  validateTicket // 👈 Importado
} from "../controllers/ticket.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireOwner } from "../middlewares/requireOwner.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.post("/buy", requireAuth, buyTicket);

// 🔥 HISTORIAL DEL USUARIO
router.get("/my", requireAuth, getMyTickets);

// 🔥 VALIDACIÓN DE TICKET (Owner/Admin)
router.post("/validate", requireAuth, requireAdmin, validateTicket);

export default router;
