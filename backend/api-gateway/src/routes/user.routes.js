import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/services.js';

const router = Router();

router.use(createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: (path) => `/users${path}`
}));

export default router;
