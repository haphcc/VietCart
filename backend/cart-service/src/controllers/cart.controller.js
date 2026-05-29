import { cartService } from '../services/cart.service.js';

export async function getCartByUser(req, res, next) {
  try {
    const cart = await cartService.findByUser(req.params.userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addItem(req, res, next) {
  try {
    const { user_id: userId, product_id: productId } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    if (!userId || !productId || Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const item = await cartService.addItem({ user_id: userId, product_id: productId, quantity });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateItemQuantity(req, res, next) {
  try {
    const { user_id: userId, product_id: productId } = req.body;
    const quantity = Number(req.body.quantity);
    if (!userId || !productId || Number.isNaN(quantity)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const item = await cartService.updateQuantity(userId, productId, quantity);
    if (!item) {
      return res.status(200).json({ removed: true, user_id: userId, product_id: productId });
    }

    return res.json(item);
  } catch (error) {
    return next(error);
  }
}

export async function removeItem(req, res, next) {
  try {
    await cartService.removeItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function clearCartByUser(req, res, next) {
  try {
    await cartService.clearByUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
