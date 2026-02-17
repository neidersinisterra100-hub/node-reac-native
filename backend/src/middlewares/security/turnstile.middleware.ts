/**
 * ============================================================
 * TURNSTILE MIDDLEWARE (Cloudflare CAPTCHA)
 * ============================================================
 * 
 * Implements adaptive CAPTCHA verification using Cloudflare Turnstile.
 * 
 * Activation conditions:
 * - NODE_ENV === 'production'
 * - ENABLE_TURNSTILE === 'true'
 * 
 * CAPTCHA required when:
 * - req.security.requiresCaptcha === true
 * - User has multiple failed login attempts
 * 
 * In development:
 * - Automatic bypass
 * - Logs that Turnstile is disabled
 * 
 * Order of execution: 5 (after accountLock)
 */

import { Response, NextFunction } from 'express';
import { SecurityRequest } from './security.types.js';
import { getConfig } from './security.config.js';
import { verifyTurnstile } from '../../lib/turnstitle.js';

/**
 * Turnstile middleware
 * 
 * Verifies Cloudflare Turnstile CAPTCHA when required.
 * Only active in production with ENABLE_TURNSTILE=true.
 */
export async function turnstileMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = getConfig();
  
  // Check if Turnstile is enabled
  if (!config.enableTurnstile) {
    if (config.nodeEnv === 'development') {
      console.log('[SECURITY] Turnstile disabled in development mode');
    }
    next();
    return;
  }
  
  // Check if CAPTCHA is required
  if (!req.security?.requiresCaptcha) {
    // CAPTCHA not required, proceed
    next();
    return;
  }
  
  // CAPTCHA is required - verify token
  const turnstileToken = req.body?.turnstileToken || 
                         req.headers['x-turnstile-token'] ||
                         req.headers['cf-turnstile-response'];
  
  if (!turnstileToken) {
    console.warn('[SECURITY] CAPTCHA required but no token provided:', {
      ip: req.security.ip?.substring(0, 8) + '...',
      emailHash: req.security.emailHash?.substring(0, 16) + '...',
    });
    
    req.security.auditResult = 'captcha';
    req.security.auditMetadata = {
      reason: 'missing_token',
    };
    
    res.status(403).json({
      message: 'Verificación CAPTCHA requerida.',
      requiresCaptcha: true,
      code: 'CAPTCHA_REQUIRED',
    });
    return;
  }
  
  try {
    // Verify with Cloudflare
    const isValid = await verifyTurnstile(
      turnstileToken as string,
      req.security.ip
    );
    
    if (!isValid) {
      console.warn('[SECURITY] CAPTCHA verification failed:', {
        ip: req.security.ip?.substring(0, 8) + '...',
        emailHash: req.security.emailHash?.substring(0, 16) + '...',
      });
      
      req.security.auditResult = 'captcha';
      req.security.auditMetadata = {
        reason: 'verification_failed',
      };
      
      res.status(403).json({
        message: 'Verificación CAPTCHA fallida. Por favor, intenta de nuevo.',
        requiresCaptcha: true,
        code: 'CAPTCHA_FAILED',
      });
      return;
    }
    
    console.log('[SECURITY] CAPTCHA verified successfully');
    
    // CAPTCHA passed, clear the flag
    req.security.requiresCaptcha = false;
    
    next();
  } catch (error) {
    console.error('[SECURITY] Turnstile verification error:', error);
    
    // On error in production, fail closed (require CAPTCHA)
    if (config.nodeEnv === 'production') {
      req.security.auditResult = 'captcha';
      req.security.auditMetadata = {
        reason: 'verification_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      res.status(403).json({
        message: 'Error al verificar CAPTCHA. Por favor, intenta de nuevo.',
        requiresCaptcha: true,
        code: 'CAPTCHA_ERROR',
      });
      return;
    }
    
    // In development, allow through with warning
    console.warn('[SECURITY] Turnstile error in development, allowing through');
    next();
  }
}

/**
 * Check if CAPTCHA should be required for a request
 * Can be used to pre-check before sending response
 */
export function shouldRequireCaptcha(req: SecurityRequest): boolean {
  const config = getConfig();
  
  if (!config.enableTurnstile) {
    return false;
  }
  
  return req.security?.requiresCaptcha === true;
}

/**
 * Get Turnstile site key for frontend
 * Returns null if Turnstile is disabled
 */
export function getTurnstileSiteKey(): string | null {
  const config = getConfig();
  
  if (!config.enableTurnstile) {
    return null;
  }
  
  return process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || null;
}
