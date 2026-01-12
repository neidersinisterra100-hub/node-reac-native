import { Router } from "express";
import { setAdminSchedule, getSchedule } from "../controllers/schedule.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

// Asignar turno (Solo Owner)
router.post("/", requireAuth, requireOwner, setAdminSchedule);

// Obtener calendario (Owner y Admin)
router.get("/", requireAuth, getSchedule);

export default router;