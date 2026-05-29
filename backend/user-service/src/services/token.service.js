import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'vietcart_dev_secret';
const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

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
