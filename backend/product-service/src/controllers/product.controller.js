import { productService } from '../services/product.service.js';

function handleServiceError(error, res, next) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (
    error.message.includes('not found') ||
    error.message.includes('not have enough stock') ||
    error.message.includes('do not exist') ||
    error.message.includes('expired') ||
    error.message.includes('released')
  ) {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({
      message: 'Product is referenced by stock reservations and cannot be deleted'
    });
  }

  return next(error);
}

export async function getProducts(req, res, next) {
  try {
    const products = await productService.findAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const deleted = await productService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    return res.status(204).send();
  } catch (error) {
    return handleServiceError(error, res, next);
  }
}

export async function syncStock(req, res, next) {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid items array' });
    }
    const result = await productService.syncStock(items);
    res.json(result);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

export async function reserveStock(req, res, next) {
  try {
    const { items, order_id: orderId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid items array' });
    }
    const result = await productService.reserveStock(items, orderId || null);
    res.json(result);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

export async function confirmReservation(req, res, next) {
  try {
    const { reservation_ids: reservationIds } = req.body;
    if (!reservationIds || !Array.isArray(reservationIds) || reservationIds.length === 0) {
      return res.status(400).json({ message: 'Invalid reservation_ids array' });
    }
    const result = await productService.confirmReservation(reservationIds);
    res.json(result);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

export async function releaseReservation(req, res, next) {
  try {
    const { reservation_ids: reservationIds } = req.body;
    if (!reservationIds || !Array.isArray(reservationIds) || reservationIds.length === 0) {
      return res.status(400).json({ message: 'Invalid reservation_ids array' });
    }
    const result = await productService.releaseReservation(reservationIds);
    res.json(result);
  } catch (error) {
    handleServiceError(error, res, next);
  }
}

