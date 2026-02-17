/**
 * ============================================================
 * RATE LIMIT MIDDLEWARE
 * ============================================================
 * 
 * Implements multi-dimensional rate limiting:
 * - IP: 5 attempts per minute
 * - Email: 5 attempts per 10 minutes
 * - Device: 10 attempts per hour
 * 
 * Behavior:
 * - First excess → sets req.security.requiresCaptcha = true
 * - Continued abuse → responds with 429 Too Many Requests
 * - Does NOT execute login if hard limit exceeded
 * 
 * Order of execution: 3 (after deviceFingerprint)
 */

import { Response, NextFunction } from 'express';
import { SecurityRequest } from './security.types.js';
import { getConfig } from './security.config.js';
import { createHybridStore } from './rateLimitStore.js';
import { hashEmail } from './deviceFingerprint.middleware.js';

/**
 * Rate limit check result
 */
interface RateLimitResult {
  /** Whether soft limit was exceeded (require CAPTCHA) */
  softLimitExceeded: boolean;
  
  /** Whether hard limit was exceeded (block request) */
  hardLimitExceeded: boolean;
  
  /** Which dimension triggered the limit */
  triggeredBy?: 'ip' | 'email' | 'device';
  
  /** Current count for the triggered dimension */
  currentCount?: number;
  
  /** Max allowed for the triggered dimension */
  maxAllowed?: number;
  
  /** Seconds until reset */
  retryAfter?: number;
}

/**
 * Rate limit middleware
 * 
 * Checks rate limits across IP, email, and device dimensions.
 * Sets requiresCaptcha flag or blocks request based on abuse level.
 */
export async function rateLimitMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = getConfig();
  const store = createHybridStore();
  
  // Extract email from request body
  const email = req.body?.email?.toLowerCase()?.trim();
  const ip = req.security?.ip || 'unknown';
  const deviceId = req.security?.deviceId || 'unknown';
  
  // Ensure security context exists
  if (!req.security) {
    req.security = {
      ip: 'unknown',
      deviceId: 'unknown',
      requiresCaptcha: false,
      rateLimitExceeded: false,
    };
  }
  
  // Store email hash for audit
  if (email) {
    req.security.email = email;
    req.security.emailHash = hashEmail(email);
  }
  
  try {
    const result = await checkRateLimits(store, ip, email, deviceId, config);
    
    if (result.hardLimitExceeded) {
      // Hard limit exceeded - block request
      req.security.rateLimitExceeded = true;
      req.security.auditResult = 'rate_limited';
      req.security.auditMetadata = {
        triggeredBy: result.triggeredBy,
        currentCount: result.currentCount,
        maxAllowed: result.maxAllowed,
      };
      
      console.warn('[SECURITY] Rate limit HARD exceeded:', {
        ip: ip.substring(0, 8) + '...',
        dimension: result.triggeredBy,
        count: result.currentCount,
        max: result.maxAllowed,
      });
      
      res.status(429).json({
        message: 'Demasiados intentos. Por favor, espera antes de intentar de nuevo.',
        retryAfter: result.retryAfter,
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }
    
    if (result.softLimitExceeded) {
      // Soft limit exceeded - require CAPTCHA
      req.security.requiresCaptcha = true;
      
      console.log('[SECURITY] Rate limit SOFT exceeded, requiring CAPTCHA:', {
        ip: ip.substring(0, 8) + '...',
        dimension: result.triggeredBy,
      });
    }
    
    next();
  } catch (error) {
    // On error, allow request but log warning
    console.error('[SECURITY] Rate limit check failed:', error);
    next();
  }
}

/**
 * Check rate limits across all dimensions
 */
async function checkRateLimits(
  store: ReturnType<typeof createHybridStore>,
  ip: string,
  email: string | undefined,
  deviceId: string,
  config: ReturnType<typeof getConfig>
): Promise<RateLimitResult> {
  const now = Date.now();
  
  // Check IP rate limit
  const ipKey = `ip:${ip}`;
  const ipEntry = await store.increment(ipKey, config.rateLimit.ip.windowMs);
  
  if (ipEntry.count > config.rateLimit.ip.maxAttempts * 2) {
    // Hard limit: 2x the soft limit
    return {
      softLimitExceeded: true,
      hardLimitExceeded: true,
      triggeredBy: 'ip',
      currentCount: ipEntry.count,
      maxAllowed: config.rateLimit.ip.maxAttempts,
      retryAfter: Math.ceil((config.rateLimit.ip.windowMs - (now - ipEntry.windowStart)) / 1000),
    };
  }
  
  if (ipEntry.count > config.rateLimit.ip.maxAttempts) {
    return {
      softLimitExceeded: true,
      hardLimitExceeded: false,
      triggeredBy: 'ip',
      currentCount: ipEntry.count,
      maxAllowed: config.rateLimit.ip.maxAttempts,
    };
  }
  
  // Check email rate limit (if email provided)
  if (email) {
    const emailKey = `email:${hashEmail(email)}`;
    const emailEntry = await store.increment(emailKey, config.rateLimit.email.windowMs);
    
    if (emailEntry.count > config.rateLimit.email.maxAttempts * 2) {
      return {
        softLimitExceeded: true,
        hardLimitExceeded: true,
        triggeredBy: 'email',
        currentCount: emailEntry.count,
        maxAllowed: config.rateLimit.email.maxAttempts,
        retryAfter: Math.ceil((config.rateLimit.email.windowMs - (now - emailEntry.windowStart)) / 1000),
      };
    }
    
    if (emailEntry.count > config.rateLimit.email.maxAttempts) {
      return {
        softLimitExceeded: true,
        hardLimitExceeded: false,
        triggeredBy: 'email',
        currentCount: emailEntry.count,
        maxAllowed: config.rateLimit.email.maxAttempts,
      };
    }
  }
  
  // Check device rate limit
  const deviceKey = `device:${deviceId}`;
  const deviceEntry = await store.increment(deviceKey, config.rateLimit.device.windowMs);
  
  if (deviceEntry.count > config.rateLimit.device.maxAttempts * 2) {
    return {
      softLimitExceeded: true,
      hardLimitExceeded: true,
      triggeredBy: 'device',
      currentCount: deviceEntry.count,
      maxAllowed: config.rateLimit.device.maxAttempts,
      retryAfter: Math.ceil((config.rateLimit.device.windowMs - (now - deviceEntry.windowStart)) / 1000),
    };
  }
  
  if (deviceEntry.count > config.rateLimit.device.maxAttempts) {
    return {
      softLimitExceeded: true,
      hardLimitExceeded: false,
      triggeredBy: 'device',
      currentCount: deviceEntry.count,
      maxAllowed: config.rateLimit.device.maxAttempts,
    };
  }
  
  // All limits OK
  return {
    softLimitExceeded: false,
    hardLimitExceeded: false,
  };
}

/**
 * Reset rate limits for a specific email (call on successful login)
 */
export async function resetRateLimitsForEmail(email: string): Promise<void> {
  const store = createHybridStore();
  const emailKey = `email:${hashEmail(email)}`;
  
  try {
    await store.reset(emailKey);
    console.log('[SECURITY] Rate limits reset for email');
  } catch (error) {
    console.error('[SECURITY] Failed to reset rate limits:', error);
  }
}

/**
 * Reset rate limits for a specific IP
 */
export async function resetRateLimitsForIp(ip: string): Promise<void> {
  const store = createHybridStore();
  const ipKey = `ip:${ip}`;
  
  try {
    await store.reset(ipKey);
    console.log('[SECURITY] Rate limits reset for IP');
  } catch (error) {
    console.error('[SECURITY] Failed to reset rate limits:', error);
  }
}
