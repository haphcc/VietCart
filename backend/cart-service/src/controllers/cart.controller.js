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
    const item = await cartService.addItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
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
