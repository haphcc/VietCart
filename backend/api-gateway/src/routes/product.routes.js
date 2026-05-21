import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.product,
  changeOrigin: true,
  pathRewrite: (path) => `/products${path}`
}));

export default router;

