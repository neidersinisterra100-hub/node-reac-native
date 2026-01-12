import { Router } from "express";
import { wompiWebhook } from "../controllers/webhook.controller.js";

const router = Router();

/* =========================================================
   WEBHOOK WOMPI
   ========================================================= */

/**
 * POST /api/webhooks/wompi
 *
 * ⚠️ Este endpoint NO requiere autenticación
 * ⚠️ La seguridad se hace con firma
 */
router.post("/wompi", wompiWebhook);

export default router;
