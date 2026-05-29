import Redis from 'ioredis';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true
});
