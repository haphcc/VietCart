import { Router } from 'express';
import {
  createPayment,
  getPaymentByOrder,
  handlePayosWebhook,
  syncPayosStatus
} from '../controllers/payment.controller.js';

const router = Router();

router.get('/order/:orderId', getPaymentByOrder);
router.post('/payos/webhook', handlePayosWebhook);
router.post('/payos/order/:orderId/sync', syncPayosStatus);
router.post('/', createPayment);

export default router;
