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

// ===============================
// SECURITY MIDDLEWARE CHAIN
// ===============================
import {
  loginSecurityChain,
  basicSecurityChain,
  minimalSecurityChain,
} from "../middlewares/security/index.js";

const router = Router();

/* =========================================================
   AUTH ROUTES
   ========================================================= */

/**
 * POST /api/auth/register
 * - Crea usuario
 * - Envía email de verificación
 * 
 * Security: Basic chain (IP + fingerprint + rate limit + audit)
 */
router.post("/register",
  ...basicSecurityChain,
  register
);

/**
 * POST /api/auth/login
 * - Inicia sesión
 * - Bloquea si email no está verificado
 * 
 * Security: Full chain (IP + fingerprint + rate limit + account lock + turnstile + audit)
 * 
 * EXECUTION ORDER:
 * 1. resolveIp       - Resolves real client IP
 * 2. deviceFingerprint - Creates device fingerprint
 * 3. rateLimit       - Multi-dimensional rate limiting
 * 4. accountLock     - Account-level lockout check
 * 5. turnstile       - CAPTCHA verification (production only)
 * 6. auditLog        - Records login attempt
 * 7. login           - Actual authentication
 */
router.post("/login",
  ...loginSecurityChain,
  login
);

/**
 * GET /api/auth/verify-email
 * - Verifica email por token
 * - Redirige al frontend
 * 
 * Security: None (token-based verification)
 */
router.get("/verify-email", verifyEmail);

/**
 * POST /api/auth/resend-verification
 * - Reenvía correo de verificación
 * 
 * Security: Basic chain (rate limited)
 */
router.post("/resend-verification",
  ...basicSecurityChain,
  resendVerificationEmail
);

/**
 * POST /api/auth/request-password-reset
 * - Solicita recuperación de contraseña
 * - Siempre responde OK (seguridad)
 * 
 * Security: Basic chain (rate limited)
 */
router.post("/request-password-reset",
  ...basicSecurityChain,
  requestPasswordReset
);

/**
 * POST /api/auth/reset-password
 * - Cambia la contraseña usando token
 * 
 * Security: Minimal chain (IP + fingerprint only)
 */
router.post("/reset-password",
  ...minimalSecurityChain,
  resetPassword
);

export default router;
