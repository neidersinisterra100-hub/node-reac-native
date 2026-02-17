/**
 * ============================================================
 * AUDIT LOG MIDDLEWARE
 * ============================================================
 * 
 * Records login attempts for security auditing.
 * 
 * Logged data per attempt:
 * - ip: Client IP address
 * - emailHash: SHA-256 hash of email (never plain text)
 * - deviceId: Device fingerprint
 * - result: success | fail | blocked | captcha | locked | rate_limited
 * - timestamp: ISO 8601 timestamp
 * 
 * Order of execution: 6 (after turnstile, before login controller)
 */

import { Response, NextFunction } from 'express';
import { SecurityRequest, LoginAuditEntry, AuditResult } from './security.types.js';
import { Schema, model, Document } from 'mongoose';

/**
 * Login audit log schema for MongoDB
 */
interface ILoginAuditLog extends Document {
  ip: string;
  emailHash: string;
  deviceId: string;
  result: AuditResult;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const LoginAuditLogSchema = new Schema<ILoginAuditLog>(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    emailHash: {
      type: String,
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    result: {
      type: String,
      enum: ['success', 'fail', 'blocked', 'captcha', 'locked', 'rate_limited'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false, // We use our own timestamp field
    collection: 'login_audit_logs',
  }
);

// TTL index to auto-delete old logs (90 days)
LoginAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Compound indexes for common queries
LoginAuditLogSchema.index({ emailHash: 1, timestamp: -1 });
LoginAuditLogSchema.index({ ip: 1, timestamp: -1 });
LoginAuditLogSchema.index({ result: 1, timestamp: -1 });

export const LoginAuditLogModel = model<ILoginAuditLog>('LoginAuditLog', LoginAuditLogSchema);

/**
 * Audit log middleware
 * 
 * Records the login attempt after all security checks pass.
 * Uses response finish event to capture final result.
 */
export function auditLogMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  
  // Use 'finish' event to capture response after it's sent
  res.on('finish', () => {
    // Determine result based on status code and security context
    let result: AuditResult = 'fail';
    
    if (req.security?.auditResult) {
      result = req.security.auditResult;
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      result = 'success';
    } else if (res.statusCode === 429) {
      result = 'rate_limited';
    } else if (res.statusCode === 423) {
      result = 'locked';
    } else if (res.statusCode === 403) {
      result = 'captcha';
    } else if (res.statusCode === 401) {
      result = 'fail';
    }
    
    // Log asynchronously (don't block response)
    setImmediate(() => {
      logLoginAttempt(req, result, startTime).catch((error) => {
        console.error('[SECURITY] Failed to log audit entry:', error);
      });
    });
  });
  
  next();
}

/**
 * Log a login attempt to the database
 */
async function logLoginAttempt(
  req: SecurityRequest,
  result: AuditResult,
  startTime: number
): Promise<void> {
  const entry: LoginAuditEntry = {
    ip: req.security?.ip || 'unknown',
    emailHash: req.security?.emailHash || 'unknown',
    deviceId: req.security?.deviceId || 'unknown',
    result,
    timestamp: new Date().toISOString(),
    metadata: {
      ...req.security?.auditMetadata,
      responseTimeMs: Date.now() - startTime,
      userAgent: req.headers['user-agent']?.substring(0, 200), // Truncate for storage
    },
  };
  
  // Log to console (structured)
  console.log('[SECURITY] Login attempt:', {
    ip: entry.ip.substring(0, 8) + '...',
    emailHash: entry.emailHash.substring(0, 16) + '...',
    deviceId: entry.deviceId.substring(0, 16) + '...',
    result: entry.result,
    timestamp: entry.timestamp,
  });
  
  // Save to database
  try {
    await LoginAuditLogModel.create({
      ip: entry.ip,
      emailHash: entry.emailHash,
      deviceId: entry.deviceId,
      result: entry.result,
      timestamp: new Date(entry.timestamp),
      metadata: entry.metadata,
    });
  } catch (error) {
    // Don't throw - audit logging should not break login
    console.error('[SECURITY] Failed to save audit log:', error);
  }
}

/**
 * Query recent login attempts for an email
 */
export async function getRecentLoginAttempts(
  emailHash: string,
  limit: number = 10
): Promise<ILoginAuditLog[]> {
  return LoginAuditLogModel.find({ emailHash })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

/**
 * Query recent login attempts from an IP
 */
export async function getRecentLoginAttemptsFromIp(
  ip: string,
  limit: number = 10
): Promise<ILoginAuditLog[]> {
  return LoginAuditLogModel.find({ ip })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

/**
 * Count failed attempts for an email in a time window
 */
export async function countFailedAttempts(
  emailHash: string,
  windowMs: number
): Promise<number> {
  const since = new Date(Date.now() - windowMs);
  
  return LoginAuditLogModel.countDocuments({
    emailHash,
    result: { $in: ['fail', 'blocked', 'captcha'] },
    timestamp: { $gte: since },
  });
}

/**
 * Get login statistics for monitoring
 */
export async function getLoginStats(
  windowMs: number = 3600000 // 1 hour default
): Promise<{
  total: number;
  success: number;
  failed: number;
  blocked: number;
  rateLimited: number;
}> {
  const since = new Date(Date.now() - windowMs);
  
  const results = await LoginAuditLogModel.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: '$result',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    blocked: 0,
    rateLimited: 0,
  };
  
  for (const r of results) {
    stats.total += r.count;
    switch (r._id) {
      case 'success':
        stats.success = r.count;
        break;
      case 'fail':
        stats.failed = r.count;
        break;
      case 'blocked':
      case 'locked':
        stats.blocked += r.count;
        break;
      case 'rate_limited':
        stats.rateLimited = r.count;
        break;
    }
  }
  
  return stats;
}
