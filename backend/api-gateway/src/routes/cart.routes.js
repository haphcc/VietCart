import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.cart,
  changeOrigin: true,
  pathRewrite: (path) => `/cart${path}`
}));

export default router;

