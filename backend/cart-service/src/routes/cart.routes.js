import { Router } from 'express';
import { addItem, clearCartByUser, getCartByUser, removeItem } from '../controllers/cart.controller.js';

const router = Router();

router.get('/:userId', getCartByUser);
router.post('/items', addItem);
router.delete('/items/:itemId', removeItem);
router.delete('/user/:userId', clearCartByUser);

export default router;
