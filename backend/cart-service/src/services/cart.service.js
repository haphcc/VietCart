import { pool } from '../config/database.js';

export const cartService = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC', [userId]);
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
    return rows[0];
  },

  async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
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
    return rows[0];
  },

  async removeItem(itemId) {
    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
  },

  async clearByUser(userId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
};
