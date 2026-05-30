import { pool } from '../config/database.js';
import { cartClient } from '../clients/cart.client.js';
import { notificationClient } from '../clients/notification.client.js';
import { productClient } from '../clients/product.client.js';
import { userClient } from '../clients/user.client.js';

const ORDER_STATUSES = new Set(['pending', 'confirmed', 'shipping', 'completed', 'cancelled']);
const PAYMENT_METHODS = new Set(['cod', 'bank_transfer', 'momo', 'vnpay']);

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizePaymentMethod(method) {
  return PAYMENT_METHODS.has(method) ? method : 'cod';
}

function normalizeShippingInfo(info = {}) {
  return {
    name: (info.fullName || info.name || '').trim() || null,
    phone: (info.phone || '').trim() || null,
    address: (info.address || '').trim() || null,
    note: (info.notes || info.note || '').trim() || null
  };
}

function parseReservationIds(order) {
  if (!order?.reservation_id) return [];

  try {
    const reservationIds = JSON.parse(order.reservation_id);
    return Array.isArray(reservationIds) ? reservationIds : [];
  } catch {
    return [];
  }
}

export const orderService = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT
        o.*,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       ORDER BY o.id DESC`
    );
    return rows;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT
        o.*,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id, { includeItems = true } = {}) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const order = rows[0] || null;
    if (!order || !includeItems) return order;

    const items = await this.findItemsByOrderId(id);
    return {
      ...order,
      item_count: items.length,
      items
    };
  },

  async findItemsByOrderId(orderId) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [orderId]);
    return Promise.all(items.map(async (item) => {
      const normalizedItem = {
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
        subtotal: Number(item.price) * Number(item.quantity)
      };

      try {
        const product = await productClient.getById(item.product_id);
        return {
          ...normalizedItem,
          product_name: product.name,
          image_url: product.image_url,
          product_description: product.description
        };
      } catch (error) {
        console.warn(`Product detail lookup skipped for product ${item.product_id}: ${error.message}`);
        return {
          ...normalizedItem,
          product_name: `Product #${item.product_id}`,
          image_url: null
        };
      }
    }));
  },

  async updateStatus(id, status) {
    if (!ORDER_STATUSES.has(status)) {
      throw createError(400, 'Invalid order status');
    }

    const currentOrder = await this.findById(id, { includeItems: false });
    if (!currentOrder) {
      throw createError(404, 'Order not found');
    }

    if (status === 'confirmed' && currentOrder.status !== 'confirmed') {
      const reservationIds = parseReservationIds(currentOrder);
      if (reservationIds.length > 0) {
        await productClient.confirmReservation(reservationIds);
      }
    }

    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      const reservationIds = parseReservationIds(currentOrder);

      if (reservationIds.length > 0) {
        await productClient.releaseReservation(reservationIds);
      } else {
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
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    const shippingInfo = normalizeShippingInfo(payload.shipping_info);

    if (!userId) {
      throw createError(400, 'User ID is required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, 'Order must contain at least one item');
    }

    for (const item of items) {
      if (!item.product_id || Number(item.quantity) <= 0) {
        throw createError(400, 'Invalid order item');
      }
    }

    let reservation;
    try {
      reservation = await productClient.reserveStock(items);
    } catch (reserveError) {
      const message = reserveError.response?.data?.message || reserveError.message;
      throw new Error(message);
    }

    const { reservationIds, reservedItems } = reservation;
    const detailedItems = items.map((item, index) => {
      if (!reservedItems[index]) {
        throw createError(400, 'Invalid order item');
      }

      return {
        ...item,
        quantity: Number(item.quantity),
        price: reservedItems[index].price,
        subtotal: Number(reservedItems[index].price) * Number(item.quantity)
      };
    });
    const total = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const connection = await pool.getConnection();
    let committed = false;
    let orderId = null;

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          user_id,
          total_amount,
          status,
          payment_method,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_note,
          reservation_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          total,
          'pending',
          normalizedPaymentMethod,
          shippingInfo.name,
          shippingInfo.phone,
          shippingInfo.address,
          shippingInfo.note,
          JSON.stringify(reservationIds)
        ]
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

      const { eventBus } = await import('../events/eventBus.js');
      eventBus.publish('order.created', {
        orderId,
        userId,
        reservationIds,
        items: detailedItems,
        paymentMethod: normalizedPaymentMethod
      });

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

      if (reservationIds?.length > 0) {
        try {
          await productClient.releaseReservation(reservationIds);
        } catch (releaseError) {
          console.error('Failed to release reservation after order creation failure:', releaseError.message);
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  }
};
