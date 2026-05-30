import { Router } from 'express';
import { createProduct, getProductById, getProducts, syncStock, reserveStock, confirmReservation, releaseReservation } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.post('/sync-stock', syncStock);
router.post('/reserve-stock', reserveStock);
router.post('/confirm-reservation', confirmReservation);
router.post('/release-reservation', releaseReservation);
router.get('/:id', getProductById);
router.post('/', createProduct);

export default router;

