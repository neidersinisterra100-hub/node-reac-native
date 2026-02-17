import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

export async function initRedis() {
  if (!process.env.REDIS_URL) {
    console.warn('[SECURITY] Redis no configurado, usando memoria');
    return;
  }

  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    redisAvailable = true;
    console.log('[SECURITY] Redis conectado');
  } catch (err) {
    console.warn('[SECURITY] Redis falló, usando memoria');
    redisClient = null;
    redisAvailable = false;
  }
}

export function getRedis() {
  return redisAvailable ? redisClient : null;
}
