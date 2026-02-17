# Security Middleware Chain - Brute Force Protection

## Overview

This module implements a comprehensive brute force protection system for the login endpoint using a modular middleware chain approach.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN REQUEST                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. resolveIp.middleware.ts                                      │
│     - Resolves real client IP                                    │
│     - Production: CF-Connecting-IP > req.ip > socket             │
│     - Development: socket.remoteAddress (accepts internal IPs)   │
│     - Result: req.security.ip                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. deviceFingerprint.middleware.ts                              │
│     - Creates device fingerprint (SHA-256)                       │
│     - Components: User-Agent, Accept-Language, Platform          │
│     - Result: req.security.deviceId                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. rateLimit.middleware.ts                                      │
│     - Multi-dimensional rate limiting                            │
│     - IP: 5 attempts/minute                                      │
│     - Email: 5 attempts/10 minutes                               │
│     - Device: 10 attempts/hour                                   │
│     - Soft limit → requiresCaptcha = true                        │
│     - Hard limit → 429 Too Many Requests                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. accountLock.middleware.ts                                    │
│     - Checks user.failedLoginAttempts                            │
│     - Checks user.lockUntil                                      │
│     - If locked → 423 Locked                                     │
│     - If threshold exceeded → requiresCaptcha = true             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. turnstile.middleware.ts                                      │
│     - Cloudflare Turnstile CAPTCHA                               │
│     - Only active in production + ENABLE_TURNSTILE=true          │
│     - Verifies if requiresCaptcha = true                         │
│     - Development: automatic bypass                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. auditLog.middleware.ts                                       │
│     - Records login attempt                                      │
│     - Data: ip, emailHash, deviceId, result, timestamp           │
│     - Stored in MongoDB (login_audit_logs collection)            │
│     - Auto-expires after 90 days                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. LOGIN CONTROLLER                                             │
│     - Actual authentication logic                                │
│     - On success: resetFailedAttempts, resetRateLimits           │
│     - On failure: incrementFailedAttempts                        │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Environment mode
NODE_ENV=development|production

# Trust proxy headers (for Cloudflare/nginx)
TRUST_PROXY=true|false

# Enable Cloudflare Turnstile CAPTCHA (production only)
ENABLE_TURNSTILE=true|false

# Cloudflare Turnstile credentials
CLOUDFLARE_TURNSTILE_SECRET=your_secret_key
CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key

# Redis URL (optional, falls back to in-memory)
REDIS_URL=redis://localhost:6379

# Rate limit configuration (optional, has defaults)
RATE_LIMIT_IP_MAX=5
RATE_LIMIT_IP_WINDOW_MS=60000
RATE_LIMIT_EMAIL_MAX=5
RATE_LIMIT_EMAIL_WINDOW_MS=600000
RATE_LIMIT_DEVICE_MAX=10
RATE_LIMIT_DEVICE_WINDOW_MS=3600000

# Account lock configuration (optional, has defaults)
ACCOUNT_LOCK_MAX_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MS=900000
CAPTCHA_THRESHOLD=3
```

## Usage

### Basic Usage (Login Endpoint)

```typescript
import { loginSecurityChain } from './middlewares/security/index.js';
import { login } from './controllers/auth.controller.js';

router.post('/login', ...loginSecurityChain, login);
```

### Available Chains

```typescript
// Full security chain for login
export const loginSecurityChain: RequestHandler[];

// Lighter chain for registration, password reset requests
export const basicSecurityChain: RequestHandler[];

// Minimal chain (IP + fingerprint only)
export const minimalSecurityChain: RequestHandler[];
```

### Custom Chain

```typescript
import { createSecurityChain } from './middlewares/security/index.js';

const customChain = createSecurityChain({
  resolveIp: true,
  deviceFingerprint: true,
  rateLimit: true,
  accountLock: false,
  turnstile: false,
  auditLog: true,
});
```

## Security Context

The middleware chain populates `req.security`:

```typescript
interface SecurityContext {
  ip: string;              // Resolved client IP
  deviceId: string;        // Device fingerprint (SHA-256)
  requiresCaptcha: boolean; // Whether CAPTCHA is required
  rateLimitExceeded: boolean; // Whether rate limit was exceeded
  emailHash?: string;      // Hashed email for audit
  email?: string;          // Raw email (internal use only)
  auditResult?: AuditResult; // Result for audit logging
  auditMetadata?: Record<string, unknown>; // Additional audit data
}
```

## User Model Fields

The system requires these fields in the User model:

```typescript
interface IUser {
  // ... existing fields ...
  
  // Security fields
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
}
```

## Audit Log Schema

Login attempts are stored in `login_audit_logs`:

```typescript
{
  ip: string;           // Client IP
  emailHash: string;    // SHA-256 of email (never plain text)
  deviceId: string;     // Device fingerprint
  result: 'success' | 'fail' | 'blocked' | 'captcha' | 'locked' | 'rate_limited';
  timestamp: Date;
  metadata?: {
    responseTimeMs: number;
    userAgent: string;
    // ... additional context
  };
}
```

## Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Login successful |
| 400 | Bad Request | Missing email/password |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | CAPTCHA required/failed, email not verified |
| 423 | Locked | Account temporarily locked |
| 429 | Too Many Requests | Rate limit exceeded |

## Development vs Production

### Development Mode
- Uses `socket.remoteAddress` for IP
- Accepts internal IPs (172.x.x.x, 192.168.x.x, 10.x.x.x)
- Turnstile CAPTCHA is bypassed
- In-memory rate limiting (if Redis unavailable)

### Production Mode
- Uses `CF-Connecting-IP` header (Cloudflare)
- Falls back to `req.ip` if trust proxy enabled
- Turnstile CAPTCHA enforced (if enabled)
- Redis recommended for rate limiting

## Helper Functions

```typescript
// Reset rate limits on successful login
await resetRateLimitsForEmail(email);
await resetRateLimitsForIp(ip);

// Manage failed attempts
await incrementFailedAttempts(email);
await resetFailedAttempts(email);
await isAccountLocked(email);

// Audit queries
await getRecentLoginAttempts(emailHash, limit);
await getRecentLoginAttemptsFromIp(ip, limit);
await countFailedAttempts(emailHash, windowMs);
await getLoginStats(windowMs);
```

## Files Structure

```
src/middlewares/security/
├── index.ts                    # Main exports, middleware chains
├── security.config.ts          # Configuration management
├── security.types.ts           # TypeScript interfaces
├── resolveIp.middleware.ts     # IP resolution
├── deviceFingerprint.middleware.ts # Device fingerprinting
├── rateLimit.middleware.ts     # Rate limiting logic
├── rateLimitStore.ts           # Redis/memory store
├── accountLock.middleware.ts   # Account lockout
├── turnstile.middleware.ts     # CAPTCHA verification
├── auditLog.middleware.ts      # Audit logging
└── README.md                   # This documentation
```

## Security Considerations

1. **Email hashing**: Emails are never logged in plain text
2. **Timing attacks**: Response times are consistent regardless of user existence
3. **Rate limiting**: Multi-dimensional to prevent distributed attacks
4. **CAPTCHA**: Adaptive, only shown when suspicious activity detected
5. **Account locking**: Temporary locks with exponential backoff potential
6. **Audit trail**: All attempts logged for forensic analysis
