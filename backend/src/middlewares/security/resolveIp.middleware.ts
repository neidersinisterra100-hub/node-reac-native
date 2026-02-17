/**
 * ============================================================
 * RESOLVE IP MIDDLEWARE
 * ============================================================
 * 
 * Resolves the real client IP address based on environment:
 * 
 * PRODUCTION (Cloudflare):
 * - Prioritizes CF-Connecting-IP header
 * - Falls back to req.ip if trust proxy is enabled
 * - Never blindly trusts X-Forwarded-For
 * 
 * DEVELOPMENT (Docker/localhost):
 * - Uses req.socket.remoteAddress
 * - Accepts internal IPs (172.x.x.x, 192.168.x.x, 10.x.x.x)
 * 
 * Result stored in: req.security.ip
 */

import { Response, NextFunction } from 'express';
import { SecurityRequest, SecurityContext } from './security.types.js';
import { getConfig } from './security.config.js';

/**
 * Check if IP is a private/internal address
 */
function isPrivateIp(ip: string): boolean {
  // Remove IPv6 prefix if present
  const cleanIp = ip.replace(/^::ffff:/, '');
  
  // Check for localhost
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return true;
  }
  
  // Check for private IPv4 ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
  ];
  
  return privateRanges.some(range => range.test(cleanIp));
}

/**
 * Extract first IP from comma-separated list
 */
function extractFirstIp(ip: string | string[] | undefined): string {
  if (!ip) return '';
  
  if (Array.isArray(ip)) {
    ip = ip[0];
  }
  
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  return (ip || '').trim();
}

/**
 * Resolve IP middleware
 * 
 * Order of execution: 1 (first in chain)
 */
export function resolveIpMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
): void {
  const config = getConfig();
  let resolvedIp = '';
  
  if (config.nodeEnv === 'production') {
    // PRODUCTION: Cloudflare environment
    // Priority: CF-Connecting-IP > req.ip (if trust proxy) > socket
    
    const cfIp = req.headers['cf-connecting-ip'];
    
    if (cfIp) {
      // Cloudflare provides the real client IP
      resolvedIp = extractFirstIp(cfIp as string);
      console.log('[SECURITY] IP resolved from CF-Connecting-IP:', resolvedIp);
    } else if (config.trustProxy && req.ip) {
      // Trust proxy is enabled, use Express's resolved IP
      resolvedIp = req.ip;
      console.log('[SECURITY] IP resolved from req.ip (trust proxy):', resolvedIp);
    } else {
      // Fallback to socket (not recommended in production)
      resolvedIp = req.socket.remoteAddress || '';
      console.warn('[SECURITY] IP resolved from socket (no CF header):', resolvedIp);
    }
  } else {
    // DEVELOPMENT: Docker/localhost environment
    // Accept internal IPs, use socket address
    
    const socketIp = req.socket.remoteAddress || '';
    resolvedIp = socketIp.replace(/^::ffff:/, ''); // Clean IPv6 prefix
    
    // In development, also check X-Forwarded-For for local proxies
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const forwardedIp = extractFirstIp(forwardedFor as string);
      if (isPrivateIp(forwardedIp)) {
        resolvedIp = forwardedIp;
      }
    }
    
    console.log('[SECURITY] IP resolved (development):', resolvedIp);
  }
  
  // Ensure we have a valid IP
  if (!resolvedIp) {
    resolvedIp = 'unknown';
    console.warn('[SECURITY] Could not resolve IP, using "unknown"');
  }
  
  // Initialize security context
  req.security = {
    ip: resolvedIp,
    deviceId: '',
    requiresCaptcha: false,
    rateLimitExceeded: false,
  } as SecurityContext;
  
  next();
}

// Re-export types for backward compatibility
export type { SecurityRequest } from './security.types.js';
