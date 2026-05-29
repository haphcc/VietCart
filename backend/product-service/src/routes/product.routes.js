import { Router } from 'express';
import { createProduct, getProductById, getProducts, syncStock } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.post('/sync-stock', syncStock);
router.get('/:id', getProductById);
router.post('/', createProduct);

export default router;

