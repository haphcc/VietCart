import { orderService } from '../services/order.service.js';

export async function getOrders(req, res, next) {
  try {
    const orders = await orderService.findAll();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

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
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.message.includes('not enough stock') || error.message.includes('cancelled')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}

export async function getOrderItems(req, res, next) {
  try {
    const items = await orderService.findItemsByOrderId(req.params.id);
    res.json(items);
  } catch (error) {
    next(error);
  }
}
