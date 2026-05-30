import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getOrderItems,
  getOrders,
  getOrdersByUser,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { authMiddleware, authOrInternalMiddleware, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, requireAdmin, getOrders);
router.get('/user/:userId', getOrdersByUser);
router.get('/:id/items', getOrderItems);
router.get('/:id', getOrderById);
router.put('/:id/status', authOrInternalMiddleware, updateOrderStatus);
router.post('/', createOrder);

export default router;
