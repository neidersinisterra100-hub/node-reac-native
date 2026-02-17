/**
 * ============================================================
 * ACCOUNT LOCK MIDDLEWARE
 * ============================================================
 * 
 * Checks and enforces account-level lockouts based on:
 * - failedLoginAttempts: Counter in UserModel
 * - lockUntil: Timestamp when lock expires
 * 
 * Behavior:
 * - If lockUntil > now → respond 423 (Locked)
 * - If failedLoginAttempts >= threshold → require CAPTCHA
 * - Does NOT continue login if account is locked
 * 
 * Order of execution: 4 (after rateLimit)
 */

import { Response, NextFunction } from 'express';
import { SecurityRequest } from './security.types.js';
import { getConfig } from './security.config.js';
import { UserModel, IUser } from '../../models/user.model.js';

/**
 * User security fields for lock checking
 */
interface UserSecurityFields {
  _id: unknown;
  email: string;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
}

/**
 * Account lock middleware
 * 
 * Checks if the user account is locked and enforces lockout.
 * Also sets requiresCaptcha if user has multiple failed attempts.
 */
export async function accountLockMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = getConfig();
  const email = req.security?.email;
  
  // Skip if no email provided
  if (!email) {
    next();
    return;
  }
  
  try {
    // Find user by email (only fetch security-related fields)
    const user = await UserModel.findOne<UserSecurityFields>(
      { email: email.toLowerCase().trim() },
      { failedLoginAttempts: 1, lockUntil: 1, email: 1 }
    ).lean();
    
    // User not found - let login controller handle it
    if (!user) {
      next();
      return;
    }
    
    const now = new Date();
    
    // Check if account is locked
    if (user.lockUntil && new Date(user.lockUntil) > now) {
      const lockRemaining = Math.ceil(
        (new Date(user.lockUntil).getTime() - now.getTime()) / 1000
      );
      
      if (req.security) {
        req.security.auditResult = 'locked';
        req.security.auditMetadata = {
          lockRemaining,
          failedAttempts: user.failedLoginAttempts,
        };
      }
      
      console.warn('[SECURITY] Account locked:', {
        emailHash: req.security?.emailHash?.substring(0, 16) + '...',
        lockRemaining,
        failedAttempts: user.failedLoginAttempts,
      });
      
      res.status(423).json({
        message: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos.',
        retryAfter: lockRemaining,
        code: 'ACCOUNT_LOCKED',
      });
      return;
    }
    
    // Check if CAPTCHA should be required based on failed attempts
    const failedAttempts = user.failedLoginAttempts || 0;
    
    if (failedAttempts >= config.accountLock.captchaThreshold) {
      if (req.security) {
        req.security.requiresCaptcha = true;
      }
      
      console.log('[SECURITY] CAPTCHA required due to failed attempts:', {
        emailHash: req.security?.emailHash?.substring(0, 16) + '...',
        failedAttempts,
        threshold: config.accountLock.captchaThreshold,
      });
    }
    
    next();
  } catch (error) {
    // On error, allow request but log warning
    console.error('[SECURITY] Account lock check failed:', error);
    next();
  }
}

/**
 * Increment failed login attempts for a user
 * Call this when login fails
 */
export async function incrementFailedAttempts(email: string): Promise<void> {
  const config = getConfig();
  
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) return;
    
    const failedAttempts = ((user as IUser).failedLoginAttempts || 0) + 1;
    
    // Check if we should lock the account
    if (failedAttempts >= config.accountLock.maxFailedAttempts) {
      const lockUntil = new Date(Date.now() + config.accountLock.lockDurationMs);
      
      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: failedAttempts,
            lockUntil,
          },
        }
      );
      
      console.warn('[SECURITY] Account locked due to failed attempts:', {
        failedAttempts,
        lockUntil: lockUntil.toISOString(),
      });
    } else {
      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: { failedLoginAttempts: failedAttempts },
        }
      );
      
      console.log('[SECURITY] Failed attempt recorded:', {
        failedAttempts,
        maxAttempts: config.accountLock.maxFailedAttempts,
      });
    }
  } catch (error) {
    console.error('[SECURITY] Failed to increment failed attempts:', error);
  }
}

/**
 * Reset failed login attempts for a user
 * Call this on successful login
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    await UserModel.updateOne(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      }
    );
    
    console.log('[SECURITY] Failed attempts reset on successful login');
  } catch (error) {
    console.error('[SECURITY] Failed to reset failed attempts:', error);
  }
}

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const user = await UserModel.findOne<UserSecurityFields>(
      { email: email.toLowerCase().trim() },
      { lockUntil: 1 }
    ).lean();
    
    if (!user || !user.lockUntil) return false;
    
    return new Date(user.lockUntil) > new Date();
  } catch (error) {
    console.error('[SECURITY] Failed to check account lock:', error);
    return false;
  }
}
