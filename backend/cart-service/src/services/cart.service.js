import { pool } from '../config/database.js';

export const cartService = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC', [userId]);
    return rows;
  },

  async addItem(payload) {
    const { user_id: userId, product_id: productId, quantity } = payload;
    const [result] = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, productId, quantity]
    );
    return { id: result.insertId, ...payload };
  },

  async removeItem(itemId) {
    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
  },

  async clearByUser(userId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
};
