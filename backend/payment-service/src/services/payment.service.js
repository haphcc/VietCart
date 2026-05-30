import { pool } from '../config/database.js';
import { orderClient } from '../clients/order.client.js';
import { payosService } from './payos.service.js';

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeMethod(method) {
  if (method === 'bank_transfer') return 'bank_transfer';
  if (method === 'cod') return 'cod';
  throw createError(400, 'Unsupported payment method');
}

function toPublicPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    order_id: row.order_id,
    amount: row.amount,
    method: row.method,
    status: row.status,
    payos_order_code: row.payos_order_code,
    payos_payment_link_id: row.payos_payment_link_id,
    payos_checkout_url: row.payos_checkout_url,
    payos_qr_code: row.payos_qr_code,
    transaction_reference: row.transaction_reference,
    paid_at: row.paid_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function getFirstTransactionReference(transactions) {
  if (!transactions) return null;
  if (Array.isArray(transactions)) return transactions[0]?.reference || null;
  const firstTransaction = Object.values(transactions)[0];
  return firstTransaction?.reference || null;
}

function generatePayosOrderCode() {
  const randomPart = Math.floor(Math.random() * 1_000);
  return Date.now() * 1_000 + randomPart;
}

export const paymentService = {
  async findByOrder(orderId) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC', [orderId]);
    return toPublicPayment(rows[0]);
  },

  async findByPayosOrderCode(orderCode) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE payos_order_code = ? LIMIT 1', [orderCode]);
    return toPublicPayment(rows[0]);
  },

  async create(payload) {
    const { order_id: orderId } = payload;
    const method = normalizeMethod(payload.method);
    const order = await orderClient.getById(orderId);
    const amount = Math.round(Number(payload.amount ?? order.total_amount));
    const existingPayment = await this.findByOrder(orderId);
    if (existingPayment) {
      return existingPayment;
    }

    if (method === 'cod') {
      const [result] = await pool.query(
        'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
        [orderId, amount, method, 'pending']
      );
      return {
        id: result.insertId,
        order_id: Number(orderId),
        amount,
        method,
        status: 'pending'
      };
    }

    const payosOrderCode = generatePayosOrderCode();
    const payosData = await payosService.createPaymentLink({
      order,
      orderCode: payosOrderCode,
      buyer: payload.buyer,
      items: payload.items
    });

    const [result] = await pool.query(
      `INSERT INTO payments (
        order_id,
        amount,
        method,
        status,
        payos_order_code,
        payos_payment_link_id,
        payos_checkout_url,
        payos_qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        amount,
        method,
        'pending',
        payosOrderCode,
        payosData.paymentLinkId,
        payosData.checkoutUrl,
        payosData.qrCode
      ]
    );

    return {
      id: result.insertId,
      order_id: Number(orderId),
      amount,
      method,
      status: 'pending',
      payos_order_code: payosOrderCode,
      payos_payment_link_id: payosData.paymentLinkId,
      payos_checkout_url: payosData.checkoutUrl,
      payos_qr_code: payosData.qrCode
    };
  },

  async markPayosPaid({ orderCode, reference }) {
    const [result] = await pool.query(
      `UPDATE payments
       SET status = 'paid', transaction_reference = ?, paid_at = CURRENT_TIMESTAMP
       WHERE payos_order_code = ? AND status <> 'paid'`,
      [reference || null, orderCode]
    );

    const payment = await this.findByPayosOrderCode(orderCode);
    if (!payment) {
      throw createError(404, 'Payment not found');
    }

    if (result.affectedRows > 0) {
      await orderClient.updateStatus(payment.order_id, 'confirmed');
    }

    return this.findByOrder(payment.order_id);
  },

  async handlePayosWebhook(webhookData) {
    if (!payosService.verifyWebhookData(webhookData.data, webhookData.signature)) {
      throw createError(400, 'Invalid PayOS webhook signature');
    }

    if (webhookData.success && webhookData.data?.code === '00') {
      await this.markPayosPaid({
        orderCode: webhookData.data.orderCode,
        reference: webhookData.data.reference
      });
    }

    return { success: true };
  },

  async syncPayosStatus(orderId) {
    const payment = await this.findByOrder(orderId);
    if (!payment || payment.method !== 'bank_transfer') {
      throw createError(404, 'PayOS payment not found');
    }

    const payosData = await payosService.getPaymentRequest(payment.payos_order_code || orderId);
    if (payosData.status === 'PAID') {
      return this.markPayosPaid({
        orderCode: payosData.orderCode,
        reference: getFirstTransactionReference(payosData.transactions)
      });
    }

    return {
      ...payment,
      payos_status: payosData.status
    };
  }
};
