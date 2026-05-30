import { redis } from '../config/redis.js';

const DEFAULT_TTL_SECONDS = Number(process.env.ORDER_CACHE_TTL_SECONDS || 60);
const CACHE_ENABLED = process.env.ORDER_CACHE_ENABLED !== 'false';
const RETRY_AFTER_MS = 30000;

let retryAfter = 0;

async function ensureRedisConnected() {
  if (!CACHE_ENABLED) return false;
  if (Date.now() < retryAfter) return false;
  if (redis.status === 'ready') return true;
  if (redis.status === 'connecting' || redis.status === 'connect') return false;

  try {
    await redis.connect();
    return true;
  } catch {
    retryAfter = Date.now() + RETRY_AFTER_MS;
    return false;
  }
}

export const orderCache = {
  keys: {
    userOrders: (userId) => `orders:user:${userId}`,
    orderDetail: (orderId) => `orders:detail:${orderId}`
  },

  async get(key) {
    if (!(await ensureRedisConnected())) return null;

    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`Order cache read skipped for ${key}: ${error.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    if (!(await ensureRedisConnected())) return;

    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      console.warn(`Order cache write skipped for ${key}: ${error.message}`);
    }
  },

  async del(keys) {
    const normalizedKeys = Array.isArray(keys) ? keys.filter(Boolean) : [keys].filter(Boolean);
    if (normalizedKeys.length === 0 || !(await ensureRedisConnected())) return;

    try {
      await redis.del(...normalizedKeys);
    } catch (error) {
      console.warn(`Order cache invalidation skipped: ${error.message}`);
    }
  }
};
