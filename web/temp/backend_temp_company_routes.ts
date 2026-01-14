import { Router } from "express";
import { 
  createCompany, 
  getMyCompanies,
  toggleCompanyActive // Asegúrate de importar esto si lo añadiste al controlador
} from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= OWNER ================= */

// Crear empresa (solo OWNER)
router.post(
  "/",
  requireAuth,
  requireOwner,
  createCompany
);

// Listar empresas (OWNER & ADMIN)
// Quitamos requireOwner porque ahora getMyCompanies maneja la lógica dual internamente
router.get(
  "/my",
  requireAuth,
  // requireOwner, <-- ELIMINADO para permitir que admin entre
  getMyCompanies
);

// Toggle Activo (OWNER & ADMIN) - Nueva ruta necesaria para el botón
// Asumiendo que implementaste toggleCompanyActive en el controlador como te mostré en rutas/viajes
// Si no lo tienes, avísame para dártelo.
router.patch(
  "/:companyId",
  requireAuth,
  toggleCompanyActive 
);

export default router;
