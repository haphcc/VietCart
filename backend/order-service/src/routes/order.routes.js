import { Router } from 'express';
import { createOrder, getOrderById, getOrdersByUser } from '../controllers/order.controller.js';

const router = Router();

router.get('/user/:userId', getOrdersByUser);
router.get('/:id', getOrderById);
router.post('/', createOrder);

export default router;
