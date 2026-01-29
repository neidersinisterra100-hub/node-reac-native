import { Router } from "express";
import {
    createMunicipio,
    getAllMunicipios,
    toggleMunicipioActive
} from "../controllers/municipio.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Públicas
router.get("/", getAllMunicipios);

// Protegidas (Owner/SuperOwner)
router.post("/", requireAuth, createMunicipio);
router.patch("/:id/toggle", requireAuth, toggleMunicipioActive);

export default router;
