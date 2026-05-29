import jwt from 'jsonwebtoken';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

if (!secret) {
  throw new Error('JWT_SECRET is required');
}

export function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
}

export function verifyUserToken(token) {
  return jwt.verify(token, secret);
}
