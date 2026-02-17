/**
 * ============================================================
 * SECURITY CONFIGURATION
 * ============================================================
 * 
 * Centralized configuration for brute force protection system.
 * All values can be overridden via environment variables.
 * 
 * Environment Variables:
 * - NODE_ENV: 'development' | 'production'
 * - TRUST_PROXY: 'true' | 'false'
 * - ENABLE_TURNSTILE: 'true' | 'false'
 * - REDIS_URL: Redis connection string (optional)
 */

export interface SecurityConfig {
  /** Environment mode */
  nodeEnv: 'development' | 'production';
  
  /** Trust proxy headers (Cloudflare, nginx, etc.) */
  trustProxy: boolean;
  
  /** Enable Cloudflare Turnstile CAPTCHA */
  enableTurnstile: boolean;
  
  /** Rate limit configuration */
  rateLimit: {
    /** IP-based: max attempts per window */
    ip: {
      maxAttempts: number;
      windowMs: number;
    };
    /** Email-based: max attempts per window */
    email: {
      maxAttempts: number;
      windowMs: number;
    };
    /** Device-based: max attempts per window */
    device: {
      maxAttempts: number;
      windowMs: number;
    };
  };
  
  /** Account lock configuration */
  accountLock: {
    /** Max failed attempts before lock */
    maxFailedAttempts: number;
    /** Lock duration in milliseconds */
    lockDurationMs: number;
    /** Threshold for requiring CAPTCHA */
    captchaThreshold: number;
  };
}

/**
 * Get security configuration from environment
 */
export function getSecurityConfig(): SecurityConfig {
  const nodeEnv = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production';
  
  return {
    nodeEnv,
    
    trustProxy: process.env.TRUST_PROXY === 'true',
    
    enableTurnstile: 
      nodeEnv === 'production' && 
      process.env.ENABLE_TURNSTILE === 'true',
    
    rateLimit: {
      ip: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_IP_MAX || '5', 10),
        windowMs: parseInt(process.env.RATE_LIMIT_IP_WINDOW_MS || '60000', 10), // 1 minute
      },
      email: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_EMAIL_MAX || '5', 10),
        windowMs: parseInt(process.env.RATE_LIMIT_EMAIL_WINDOW_MS || '600000', 10), // 10 minutes
      },
      device: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_DEVICE_MAX || '10', 10),
        windowMs: parseInt(process.env.RATE_LIMIT_DEVICE_WINDOW_MS || '3600000', 10), // 1 hour
      },
    },
    
    accountLock: {
      maxFailedAttempts: parseInt(process.env.ACCOUNT_LOCK_MAX_ATTEMPTS || '5', 10),
      lockDurationMs: parseInt(process.env.ACCOUNT_LOCK_DURATION_MS || '900000', 10), // 15 minutes
      captchaThreshold: parseInt(process.env.CAPTCHA_THRESHOLD || '3', 10),
    },
  };
}

/** Singleton config instance */
let configInstance: SecurityConfig | null = null;

/**
 * Get cached security configuration
 */
export function getConfig(): SecurityConfig {
  if (!configInstance) {
    configInstance = getSecurityConfig();
  }
  return configInstance;
}

/**
 * Reset config (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}
