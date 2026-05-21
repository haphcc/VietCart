import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: (path) => `/payments${path}`
}));

export default router;

