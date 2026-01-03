import { Router } from "express";
import {
  buyTicket,
  getMyTickets,
} from "../controllers/ticket.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/buy", requireAuth, buyTicket);

// 🔥 HISTORIAL DEL USUARIO
router.get("/my", requireAuth, getMyTickets);

export default router;
