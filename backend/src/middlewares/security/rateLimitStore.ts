/**
 * ============================================================
 * RATE LIMIT STORE
 * ============================================================
 * 
 * Provides storage for rate limiting with Redis support.
 * Falls back to in-memory storage if Redis is unavailable.
 * 
 * Features:
 * - Redis-first with automatic fallback
 * - TTL-based expiration
 * - Thread-safe operations
 */

import { RateLimitEntry, RateLimitStore } from './security.types.js';
import { getRedis } from '../../lib/redis.client.js';

/**
 * In-memory store for rate limiting
 * Used when Redis is not available
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }
  
  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    return entry;
  }
  
  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const existing = this.store.get(key);
    
    if (existing && (now - existing.windowStart) < windowMs) {
      // Within window, increment
      existing.count++;
      this.store.set(key, existing);
      return existing;
    }
    
    // New window
    const entry: RateLimitEntry = {
      count: 1,
      windowStart: now,
      firstAttempt: now,
    };
    
    this.store.set(key, entry);
    return entry;
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour max retention
    
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > maxAge) {
        this.store.delete(key);
      }
    }
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

/**
 * Redis-based rate limit store
 */
class RedisRateLimitStore implements RateLimitStore {
  private prefix = 'ratelimit:';
  
  async get(key: string): Promise<RateLimitEntry | null> {
    const redis = getRedis();
    if (!redis) return null;
    
    try {
      const data = await redis.get(this.prefix + key);
      if (!data) return null;
      
      return JSON.parse(data) as RateLimitEntry;
    } catch (error) {
      console.error('[SECURITY] Redis get error:', error);
      return null;
    }
  }
  
  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const redis = getRedis();
    if (!redis) {
      throw new Error('Redis not available');
    }
    
    const now = Date.now();
    const fullKey = this.prefix + key;
    
    try {
      const existing = await this.get(key);
      
      if (existing && (now - existing.windowStart) < windowMs) {
        // Within window, increment
        existing.count++;
        await redis.set(fullKey, JSON.stringify(existing), {
          PX: windowMs - (now - existing.windowStart),
        });
        return existing;
      }
      
      // New window
      const entry: RateLimitEntry = {
        count: 1,
        windowStart: now,
        firstAttempt: now,
      };
      
      await redis.set(fullKey, JSON.stringify(entry), {
        PX: windowMs,
      });
      
      return entry;
    } catch (error) {
      console.error('[SECURITY] Redis increment error:', error);
      throw error;
    }
  }
  
  async reset(key: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    
    try {
      await redis.del(this.prefix + key);
    } catch (error) {
      console.error('[SECURITY] Redis reset error:', error);
    }
  }
}

/**
 * Singleton instances
 */
let inMemoryStore: InMemoryRateLimitStore | null = null;
let redisStore: RedisRateLimitStore | null = null;

/**
 * Get the appropriate rate limit store
 * Prefers Redis, falls back to in-memory
 */
export function getRateLimitStore(): RateLimitStore {
  const redis = getRedis();
  
  if (redis) {
    if (!redisStore) {
      redisStore = new RedisRateLimitStore();
      console.log('[SECURITY] Using Redis for rate limiting');
    }
    return redisStore;
  }
  
  // Fallback to in-memory
  if (!inMemoryStore) {
    inMemoryStore = new InMemoryRateLimitStore();
    console.warn('[SECURITY] Redis not available, using in-memory rate limiting');
    console.warn('[SECURITY] ⚠️ In-memory store does not persist across restarts');
  }
  
  return inMemoryStore;
}

/**
 * Create a hybrid store that tries Redis first, falls back to memory
 */
export function createHybridStore(): RateLimitStore {
  return {
    async get(key: string): Promise<RateLimitEntry | null> {
      const redis = getRedis();
      
      if (redis) {
        if (!redisStore) redisStore = new RedisRateLimitStore();
        try {
          return await redisStore.get(key);
        } catch {
          // Fall through to memory
        }
      }
      
      if (!inMemoryStore) inMemoryStore = new InMemoryRateLimitStore();
      return inMemoryStore.get(key);
    },
    
    async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
      const redis = getRedis();
      
      if (redis) {
        if (!redisStore) redisStore = new RedisRateLimitStore();
        try {
          return await redisStore.increment(key, windowMs);
        } catch {
          // Fall through to memory
        }
      }
      
      if (!inMemoryStore) inMemoryStore = new InMemoryRateLimitStore();
      return inMemoryStore.increment(key, windowMs);
    },
    
    async reset(key: string): Promise<void> {
      const redis = getRedis();
      
      if (redis) {
        if (!redisStore) redisStore = new RedisRateLimitStore();
        try {
          await redisStore.reset(key);
        } catch {
          // Continue to memory
        }
      }
      
      if (inMemoryStore) {
        await inMemoryStore.reset(key);
      }
    },
  };
}
