import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getOrderItems,
  getOrders,
  getOrdersByUser,
  updateOrderStatus
} from '../controllers/order.controller.js';

const router = Router();

router.get('/', getOrders);
router.get('/user/:userId', getOrdersByUser);
router.get('/:id/items', getOrderItems);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.post('/', createOrder);

export default router;
