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

const router = Router();

router.get('/', getProducts);
router.post('/sync-stock', syncStock);
router.post('/reserve-stock', reserveStock);
router.post('/confirm-reservation', confirmReservation);
router.post('/release-reservation', releaseReservation);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

