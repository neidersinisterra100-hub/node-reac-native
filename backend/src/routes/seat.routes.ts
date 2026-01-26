import { Router } from "express";
import { getTripSeats } from "../controllers/seat.controller.js";

const router = Router();

router.get("/trips/:tripId/seats", getTripSeats);

export default router;
