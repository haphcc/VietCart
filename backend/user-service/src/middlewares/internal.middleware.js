import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const internalApiKey = process.env.INTERNAL_API_KEY;

export function authOrInternalMiddleware(req, res, next) {
  if (internalApiKey && req.headers['x-internal-api-key'] === internalApiKey) {
    req.internal = true;
    return next();
  }

  return next('route');
}
