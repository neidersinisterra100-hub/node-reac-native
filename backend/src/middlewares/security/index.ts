/**
 * ============================================================
 * SECURITY MIDDLEWARE CHAIN
 * ============================================================
 * 
 * Exports the complete brute force protection middleware chain
 * for the login endpoint.
 * 
 * EXECUTION ORDER:
 * 1. resolveIp       - Resolves real client IP
 * 2. deviceFingerprint - Creates device fingerprint
 * 3. rateLimit       - Multi-dimensional rate limiting
 * 4. accountLock     - Account-level lockout check
 * 5. turnstile       - CAPTCHA verification (production only)
 * 6. auditLog        - Records login attempt
 * 7. [login controller] - Actual authentication
 * 
 * USAGE:
 * ```typescript
 * import { loginSecurityChain } from './middlewares/security/index.js';
 * 
 * router.post('/login', ...loginSecurityChain, loginController);
 * ```
 */

import { RequestHandler } from 'express';

// Middlewares
import { resolveIpMiddleware } from './resolveIp.middleware.js';
import { deviceFingerprintMiddleware } from './deviceFingerprint.middleware.js';
import { rateLimitMiddleware } from './rateLimit.middleware.js';
import { accountLockMiddleware } from './accountLock.middleware.js';
import { turnstileMiddleware } from './turnstile.middleware.js';
import { auditLogMiddleware } from './auditLog.middleware.js';

// Types
export type { SecurityRequest, SecurityContext, AuditResult } from './security.types.js';

// Config
export { getConfig, getSecurityConfig, resetConfig } from './security.config.js';

// Individual middleware exports
export { resolveIpMiddleware } from './resolveIp.middleware.js';
export { deviceFingerprintMiddleware, hashEmail } from './deviceFingerprint.middleware.js';
export { 
  rateLimitMiddleware, 
  resetRateLimitsForEmail, 
  resetRateLimitsForIp 
} from './rateLimit.middleware.js';
export { 
  accountLockMiddleware, 
  incrementFailedAttempts, 
  resetFailedAttempts,
  isAccountLocked 
} from './accountLock.middleware.js';
export { 
  turnstileMiddleware, 
  shouldRequireCaptcha, 
  getTurnstileSiteKey 
} from './turnstile.middleware.js';
export { 
  auditLogMiddleware, 
  LoginAuditLogModel,
  getRecentLoginAttempts,
  getRecentLoginAttemptsFromIp,
  countFailedAttempts,
  getLoginStats
} from './auditLog.middleware.js';

// Rate limit store
export { getRateLimitStore, createHybridStore } from './rateLimitStore.js';

/**
 * Complete security middleware chain for login endpoint
 * 
 * Order:
 * 1. resolveIp
 * 2. deviceFingerprint
 * 3. rateLimit
 * 4. accountLock
 * 5. turnstile
 * 6. auditLog
 */
export const loginSecurityChain: RequestHandler[] = [
  resolveIpMiddleware as unknown as RequestHandler,
  deviceFingerprintMiddleware as unknown as RequestHandler,
  rateLimitMiddleware as unknown as RequestHandler,
  accountLockMiddleware as unknown as RequestHandler,
  turnstileMiddleware as unknown as RequestHandler,
  auditLogMiddleware as unknown as RequestHandler,
];

/**
 * Lighter security chain for non-login endpoints
 * (e.g., password reset, registration)
 * 
 * Order:
 * 1. resolveIp
 * 2. deviceFingerprint
 * 3. rateLimit
 * 4. auditLog
 */
export const basicSecurityChain: RequestHandler[] = [
  resolveIpMiddleware as unknown as RequestHandler,
  deviceFingerprintMiddleware as unknown as RequestHandler,
  rateLimitMiddleware as unknown as RequestHandler,
  auditLogMiddleware as unknown as RequestHandler,
];

/**
 * Minimal security chain (IP + fingerprint only)
 * For endpoints that need tracking but not rate limiting
 */
export const minimalSecurityChain: RequestHandler[] = [
  resolveIpMiddleware as unknown as RequestHandler,
  deviceFingerprintMiddleware as unknown as RequestHandler,
];

/**
 * Helper to create custom security chain
 */
export function createSecurityChain(options: {
  resolveIp?: boolean;
  deviceFingerprint?: boolean;
  rateLimit?: boolean;
  accountLock?: boolean;
  turnstile?: boolean;
  auditLog?: boolean;
}): RequestHandler[] {
  const chain: RequestHandler[] = [];
  
  if (options.resolveIp !== false) {
    chain.push(resolveIpMiddleware as unknown as RequestHandler);
  }
  
  if (options.deviceFingerprint !== false) {
    chain.push(deviceFingerprintMiddleware as unknown as RequestHandler);
  }
  
  if (options.rateLimit) {
    chain.push(rateLimitMiddleware as unknown as RequestHandler);
  }
  
  if (options.accountLock) {
    chain.push(accountLockMiddleware as unknown as RequestHandler);
  }
  
  if (options.turnstile) {
    chain.push(turnstileMiddleware as unknown as RequestHandler);
  }
  
  if (options.auditLog) {
    chain.push(auditLogMiddleware as unknown as RequestHandler);
  }
  
  return chain;
}
