import { Router } from "express";

// ===============================
// CONTROLLERS
// ===============================
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

/* =========================================================
   AUTH ROUTES
   ========================================================= */

/**
 * POST /api/auth/register
 * - Crea usuario
 * - Envía email de verificación
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * - Inicia sesión
 * - Bloquea si email no está verificado
 */
router.post("/login", login);

/**
 * GET /api/auth/verify-email
 * - Verifica email por token
 * - Redirige al frontend
 */
router.get("/verify-email", verifyEmail);

/**
 * POST /api/auth/resend-verification
 * - Reenvía correo de verificación
 */
router.post("/resend-verification", resendVerificationEmail);

/**
 * POST /api/auth/request-password-reset
 * - Solicita recuperación de contraseña
 * - Siempre responde OK (seguridad)
 */
router.post("/request-password-reset", requestPasswordReset);

/**
 * POST /api/auth/reset-password
 * - Cambia la contraseña usando token
 */
router.post("/reset-password", resetPassword);

export default router;
