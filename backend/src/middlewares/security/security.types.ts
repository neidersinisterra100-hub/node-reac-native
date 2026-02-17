/**
 * ============================================================
 * SECURITY TYPES
 * ============================================================
 * 
 * Type definitions for the security middleware chain.
 * Extends Express Request with security context.
 */

import { Request } from 'express';

/**
 * Audit log result types
 */
export type AuditResult = 'success' | 'fail' | 'blocked' | 'captcha' | 'locked' | 'rate_limited';

/**
 * Security context attached to each request
 */
export interface SecurityContext {
  /** Resolved client IP address */
  ip: string;
  
  /** Device fingerprint hash (SHA-256) */
  deviceId: string;
  
  /** Whether CAPTCHA is required for this request */
  requiresCaptcha: boolean;
  
  /** Whether rate limit was exceeded */
  rateLimitExceeded: boolean;
  
  /** Email being used for login (hashed for audit) */
  emailHash?: string;
  
  /** Raw email (only for internal use, never logged) */
  email?: string;
  
  /** Audit result for logging */
  auditResult?: AuditResult;
  
  /** Additional audit metadata */
  auditMetadata?: Record<string, unknown>;
}

/**
 * Extended Express Request with security context
 * Note: security is optional initially, but will be set by resolveIpMiddleware
 */
export interface SecurityRequest extends Request {
  security?: SecurityContext;
}

/**
 * Rate limit store entry
 */
export interface RateLimitEntry {
  /** Number of attempts */
  count: number;
  
  /** Window start timestamp */
  windowStart: number;
  
  /** First attempt timestamp */
  firstAttempt: number;
}

/**
 * Rate limit store interface (Redis or in-memory)
 */
export interface RateLimitStore {
  /** Get entry by key */
  get(key: string): Promise<RateLimitEntry | null>;
  
  /** Increment counter and return new entry */
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;
  
  /** Reset entry */
  reset(key: string): Promise<void>;
}

/**
 * Login audit log entry
 */
export interface LoginAuditEntry {
  /** Client IP (may be hashed in logs) */
  ip: string;
  
  /** Email hash (never plain text) */
  emailHash: string;
  
  /** Device fingerprint */
  deviceId: string;
  
  /** Result of the attempt */
  result: AuditResult;
  
  /** ISO timestamp */
  timestamp: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
