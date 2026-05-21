import { Router } from 'express';
import { createPayment, getPaymentByOrder } from '../controllers/payment.controller.js';

const router = Router();

router.get('/order/:orderId', getPaymentByOrder);
router.post('/', createPayment);

export default router;

