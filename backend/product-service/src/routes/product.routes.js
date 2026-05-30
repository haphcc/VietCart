import { Router } from 'express';
import {
  confirmReservation,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  releaseReservation,
  reserveStock,
  syncStock,
  updateProduct
} from '../controllers/product.controller.js';
import { authMiddleware, requireAdmin, requireInternalApiKey } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getProducts);
router.post('/sync-stock', requireInternalApiKey, syncStock);
router.post('/reserve-stock', requireInternalApiKey, reserveStock);
router.post('/confirm-reservation', requireInternalApiKey, confirmReservation);
router.post('/release-reservation', requireInternalApiKey, releaseReservation);
router.get('/:id', getProductById);
router.post('/', authMiddleware, requireAdmin, createProduct);
router.patch('/:id', authMiddleware, requireAdmin, updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

export default router;

