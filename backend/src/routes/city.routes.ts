import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { createCity, getAllCities } from "../controllers/city.controller.js";

const router = Router();

// Públicas
router.get("/", getAllCities);

// Privadas
router.post("/", requireAuth, createCity);

export default router;
