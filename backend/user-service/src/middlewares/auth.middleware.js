import { verifyUserToken } from '../services/token.service.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Bearer token is required' });
  }

  try {
    req.user = verifyUserToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function authorizeSelfOrAdmin(req, res, next) {
  if (req.user?.role === 'admin' || Number(req.user?.id) === Number(req.params.id)) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden' });
}
