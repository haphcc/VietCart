import jwt from 'jsonwebtoken';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const jwtSecret = process.env.JWT_SECRET;
const internalApiKey = process.env.INTERNAL_API_KEY;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

function verifyBearer(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return jwt.verify(token, jwtSecret);
}

export function authMiddleware(req, res, next) {
  try {
    const user = verifyBearer(req);
    if (!user) return res.status(401).json({ message: 'Bearer token is required' });

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireInternalApiKey(req, res, next) {
  if (internalApiKey && req.headers['x-internal-api-key'] === internalApiKey) {
    return next();
  }

  return res.status(401).json({ message: 'Internal API key is required' });
}

export function authorizeUserParam(req, res, next) {
  if (req.user?.role === 'admin' || Number(req.user?.id) === Number(req.params.userId)) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden' });
}
