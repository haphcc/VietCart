import { orderService } from '../services/order.service.js';

export async function getOrdersByUser(req, res, next) {
  try {
    const orders = await orderService.findByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
