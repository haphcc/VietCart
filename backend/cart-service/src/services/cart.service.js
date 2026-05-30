import { pool } from '../config/database.js';
import { cartCache } from '../utils/cache.js';

export const cartService = {
  async findByUser(userId) {
    const cacheKey = cartCache.keys.userCart(userId);
    const cached = await cartCache.get(cacheKey);
    if (cached) return cached;

    const [rows] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC', [userId]);
    await cartCache.set(cacheKey, rows);
    return rows;
  },

  async addItem(payload) {
    const { user_id: userId, product_id: productId, quantity } = payload;
    await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [userId, productId, quantity]
    );
    const [rows] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId]
    );
    await cartCache.del(cartCache.keys.userCart(userId));
    return rows[0];
  },

  async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
      await cartCache.del(cartCache.keys.userCart(userId));
      return null;
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
    const [rows] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId]
    );
    await cartCache.del(cartCache.keys.userCart(userId));
    return rows[0];
  },

  async removeItem(itemId) {
    const [rows] = await pool.query('SELECT user_id FROM cart_items WHERE id = ? LIMIT 1', [itemId]);
    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    if (rows[0]?.user_id) {
      await cartCache.del(cartCache.keys.userCart(rows[0].user_id));
    }
  },

  async clearByUser(userId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    await cartCache.del(cartCache.keys.userCart(userId));
  }
};
