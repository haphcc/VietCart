import { productService } from '../services/product.service.js';

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
    next(error);
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
    // Treat stock shortage or product not found as a bad request rather than server error
    if (error.message.includes('not found') || error.message.includes('not have enough stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

