import Redis from 'ioredis';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: () => null
});

let lastRedisErrorLogAt = 0;

redis.on('error', (error) => {
  const now = Date.now();
  if (now - lastRedisErrorLogAt < 30000) return;
  lastRedisErrorLogAt = now;
  console.warn(`Order Redis cache unavailable: ${error.message || 'connection failed'}`);
});
