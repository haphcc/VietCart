import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.order,
  changeOrigin: true,
  pathRewrite: (path) => `/orders${path}`
}));

export default router;

