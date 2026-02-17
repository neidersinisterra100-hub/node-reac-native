/**
 * ============================================================
 * DEVICE FINGERPRINT MIDDLEWARE
 * ============================================================
 * 
 * Creates a device fingerprint using SHA-256 hash of:
 * - User-Agent
 * - Accept-Language
 * - Platform (sec-ch-ua-platform)
 * 
 * This provides a lightweight device identification without
 * external dependencies. Not meant to be foolproof, but adds
 * an extra dimension for rate limiting.
 * 
 * Result stored in: req.security.deviceId
 * 
 * Order of execution: 2 (after resolveIp)
 */

import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { SecurityRequest } from './security.types.js';

/**
 * Generate SHA-256 hash of input string
 */
function sha256(input: string): string {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
}

/**
 * Device fingerprint middleware
 * 
 * Creates a deterministic device ID from browser headers.
 * This is not a perfect fingerprint but provides reasonable
 * device identification for rate limiting purposes.
 */
export function deviceFingerprintMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): void {
  // Collect fingerprint components
  const userAgent = req.headers['user-agent'] || 'unknown';
  const acceptLanguage = req.headers['accept-language'] || 'unknown';
  const platform = req.headers['sec-ch-ua-platform'] || 
                   req.headers['sec-ch-ua'] || 
                   'unknown';
  
  // Additional entropy from other headers (if available)
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const connection = req.headers['connection'] || '';
  
  // Build fingerprint string
  const fingerprintComponents = [
    userAgent,
    acceptLanguage,
    platform,
    acceptEncoding,
    connection,
  ].join('|');
  
  // Generate hash
  const deviceId = sha256(fingerprintComponents);
  
  // Store in security context
  if (req.security) {
    req.security.deviceId = deviceId;
  } else {
    // Fallback if resolveIp didn't run (shouldn't happen)
    req.security = {
      ip: 'unknown',
      deviceId,
      requiresCaptcha: false,
      rateLimitExceeded: false,
    };
  }
  
  console.log('[SECURITY] Device fingerprint generated:', deviceId.substring(0, 16) + '...');
  
  next();
}

/**
 * Hash email for audit logging
 * Never log plain text emails
 */
export function hashEmail(email: string): string {
  return sha256(email.toLowerCase().trim());
}
