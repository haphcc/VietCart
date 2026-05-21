import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: (path) => `/notifications${path}`
}));

export default router;

