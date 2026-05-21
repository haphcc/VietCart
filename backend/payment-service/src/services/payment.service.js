import { pool } from '../config/database.js';
import { orderClient } from '../clients/order.client.js';

export const paymentService = {
  async findByOrder(orderId) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC', [orderId]);
    return rows[0] || null;
  },

  async create(payload) {
    const { order_id: orderId, amount, method } = payload;
    await orderClient.getById(orderId);
    const [result] = await pool.query(
      'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
      [orderId, amount, method, 'paid']
    );
    return { id: result.insertId, status: 'paid', ...payload };
  }
};
