import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwnerOrAdmin } from "../middlewares/role.middleware.js";
// import { requirePlan } from "../middlewares/plan.middleware.js"; // 👈 Desactivamos temporalmente
import { getSalesReport, getOccupancyReport } from "../controllers/report.controller.js";

const router = Router();

/* =========================================================
   REPORTES PRO
   - Requieren Autenticación + Rol Admin/Owner
   - (Plan PRO desactivado temporalmente para pruebas)
   ========================================================= */

router.get(
    "/sales",
    requireAuth,
    requireOwnerOrAdmin,
    // requirePlan('pro'), 
    getSalesReport
);

router.get(
    "/occupancy",
    requireAuth,
    requireOwnerOrAdmin,
    // requirePlan('pro'),
    getOccupancyReport
);

export default router;
