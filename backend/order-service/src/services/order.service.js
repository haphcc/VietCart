import { pool } from '../config/database.js';
import { cartClient } from '../clients/cart.client.js';
import { notificationClient } from '../clients/notification.client.js';
import { productClient } from '../clients/product.client.js';
import { userClient } from '../clients/user.client.js';

export const orderService = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findItemsByOrderId(orderId) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return Promise.all(items.map(async (item) => {
      try {
        const product = await productClient.getById(item.product_id);
        return {
          ...item,
          product_name: product.name,
          image_url: product.image_url
        };
      } catch (error) {
        console.warn(`Product detail lookup skipped for product ${item.product_id}: ${error.message}`);
        return {
          ...item,
          product_name: `Product #${item.product_id}`,
          image_url: null
        };
      }
    }));
  },

  async updateStatus(id, status) {
    const currentOrder = await this.findById(id);
    if (!currentOrder) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      // Try to release reservation first (for orders that used reservation flow)
      if (currentOrder.reservation_id) {
        try {
          const reservationIds = JSON.parse(currentOrder.reservation_id);
          await productClient.releaseReservation(reservationIds);
        } catch (releaseError) {
          console.warn(`Reservation release failed, falling back to syncStock: ${releaseError.message}`);
          // Fallback: use syncStock with negative quantities for backwards compatibility
          const [items] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
          if (items.length > 0) {
            await productClient.syncStock(items.map((item) => ({
              product_id: item.product_id,
              quantity: -Number(item.quantity)
            })));
          }
        }
      } else {
        // Legacy orders without reservation_id
        const [items] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        if (items.length > 0) {
          await productClient.syncStock(items.map((item) => ({
            product_id: item.product_id,
            quantity: -Number(item.quantity)
          })));
        }
      }
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async create(payload) {
    const { user_id: userId, items = [], payment_method: paymentMethod = 'cod' } = payload;
    const normalizedPaymentMethod = paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod';
    
    // Step 1: Reserve stock via Product Service (atomic check + hold)
    // This replaces the old check-then-act pattern that caused race conditions
    let reservation;
    try {
      reservation = await productClient.reserveStock(items);
    } catch (reserveError) {
      const message = reserveError.response?.data?.message || reserveError.message;
      throw new Error(message);
    }

    const { reservationIds, reservedItems } = reservation;

    // Calculate total from reserved items (prices come from Product Service)
    const detailedItems = items.map((item, index) => ({
      ...item,
      price: reservedItems[index].price,
      subtotal: Number(reservedItems[index].price) * Number(item.quantity)
    }));
    const total = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const connection = await pool.getConnection();
    let committed = false;
    let orderId = null;
    
    try {
      await connection.beginTransaction();
      
      // Step 2: Create order with reservation_id reference
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, status, reservation_id) VALUES (?, ?, ?, ?)',
        [userId, total, 'pending', JSON.stringify(reservationIds)]
      );
      orderId = orderResult.insertId;

      for (const item of detailedItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      await connection.commit();
      committed = true;
      
      // Step 3: Emit event to Message Queue for async stock confirmation
      const { eventBus } = await import('../events/eventBus.js');
      
      if (normalizedPaymentMethod === 'cod') {
        // COD: Confirm stock immediately via event
        eventBus.publish('order.created', {
          orderId,
          userId,
          reservationIds,
          items: detailedItems,
          paymentMethod: normalizedPaymentMethod
        });
      }
      // bank_transfer: Stock stays reserved until payment is confirmed

      // Fail-safe cleanup and notification
      try {
        await cartClient.clearByUser(userId);
      } catch (error) {
        console.warn(`Cart cleanup skipped: ${error.message}`);
      }

      try {
        const user = await userClient.getById(userId);
        await notificationClient.create({
          user_id: userId,
          title: 'Order created',
          message: normalizedPaymentMethod === 'bank_transfer'
            ? `Order #${orderId} is waiting for bank transfer payment`
            : `Order #${orderId} has been created`,
          type: 'order',
          email: user.email
        });
      } catch (error) {
        console.warn(`Order notification skipped: ${error.message}`);
      }

      const order = await this.findById(orderId);
      return {
        ...order,
        payment_method: normalizedPaymentMethod,
        items: detailedItems
      };
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      // Saga: If order creation fails, release the reservation
      try {
        await productClient.releaseReservation(reservationIds);
      } catch (releaseError) {
        console.error('Failed to release reservation after order creation failure:', releaseError.message);
      }
      throw error;
    } finally {
      connection.release();
    }
  }
};
