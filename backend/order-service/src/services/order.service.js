import { pool } from '../config/database.js';
import { cartClient } from '../clients/cart.client.js';
import { notificationClient } from '../clients/notification.client.js';
import { productClient } from '../clients/product.client.js';

export const orderService = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(payload) {
    const { user_id: userId, items = [] } = payload;
    const detailedItems = await Promise.all(items.map(async (item) => {
      const product = await productClient.getById(item.product_id);
      return {
        ...item,
        price: product.price,
        subtotal: Number(product.price) * Number(item.quantity)
      };
    }));
    const total = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [userId, total, 'pending']
      );

      for (const item of detailedItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderResult.insertId, item.product_id, item.quantity, item.price]
        );
      }

      await connection.commit();
      await cartClient.clearByUser(userId);
      await notificationClient.create({
        user_id: userId,
        title: 'Order created',
        message: `Order #${orderResult.insertId} has been created`
      });

      return { id: orderResult.insertId, user_id: userId, total_amount: total, items: detailedItems };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
