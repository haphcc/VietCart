import { paymentService } from '../services/payment.service.js';

export async function getPaymentByOrder(req, res, next) {
  try {
    const payment = await paymentService.findByOrder(req.params.orderId);
    res.json(payment);
  } catch (error) {
    next(error);
  }
}

export async function createPayment(req, res, next) {
  try {
    const payment = await paymentService.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}

export async function handlePayosWebhook(req, res, next) {
  try {
    const result = await paymentService.handlePayosWebhook(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}

export async function syncPayosStatus(req, res, next) {
  try {
    const payment = await paymentService.syncPayosStatus(req.params.orderId);
    res.json(payment);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}
