import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const PAYOS_BASE_URL = process.env.PAYOS_BASE_URL || 'https://api-merchant.payos.vn';

function getPayosConfig() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  const partnerCode = process.env.PAYOS_PARTNER_CODE || '';

  if (!clientId || !apiKey || !checksumKey) {
    const error = new Error('PAYOS_CLIENT_ID, PAYOS_API_KEY and PAYOS_CHECKSUM_KEY are required');
    error.statusCode = 500;
    throw error;
  }

  return { clientId, apiKey, checksumKey, partnerCode };
}

function signQuery(data, checksumKey) {
  return createHmac('sha256', checksumKey).update(data).digest('hex');
}

function sortObjectByKey(object) {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key];
      return result;
    }, {});
}

function objectToSignatureQuery(object) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      if (Array.isArray(value)) {
        value = JSON.stringify(value.map((item) => sortObjectByKey(item)));
      }
      if ([null, undefined, 'undefined', 'null'].includes(value)) {
        value = '';
      }
      return `${key}=${value}`;
    })
    .join('&');
}

function buildHeaders() {
  const { clientId, apiKey, partnerCode } = getPayosConfig();
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': clientId,
    'x-api-key': apiKey
  };

  if (partnerCode) {
    headers['x-partner-code'] = partnerCode;
  }

  return headers;
}

export const payosService = {
  createSignature({ amount, cancelUrl, description, orderCode, returnUrl }) {
    const { checksumKey } = getPayosConfig();
    return signQuery(
      `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`,
      checksumKey
    );
  },

  verifyWebhookData(data, signature) {
    const { checksumKey } = getPayosConfig();
    const signedData = objectToSignatureQuery(sortObjectByKey(data || {}));
    const expected = signQuery(signedData, checksumKey);

    const expectedBuffer = Buffer.from(expected, 'hex');
    const signatureBuffer = Buffer.from(String(signature || ''), 'hex');
    return expectedBuffer.length === signatureBuffer.length
      && timingSafeEqual(expectedBuffer, signatureBuffer);
  },

  async createPaymentLink({ order, orderCode, buyer, items }) {
    const amount = Math.round(Number(order.total_amount));
    const description = `VC${order.id}`;
    const returnUrl = process.env.PAYOS_RETURN_URL || 'http://localhost:5173/orders';
    const cancelUrl = process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/cart';

    const payload = {
      orderCode,
      amount,
      description,
      buyerName: buyer?.fullName || buyer?.name,
      buyerEmail: buyer?.email,
      buyerPhone: buyer?.phone,
      buyerAddress: buyer?.address,
      items: (items || []).map((item) => ({
        name: item.name || `Product #${item.product_id}`,
        quantity: Number(item.quantity),
        price: Math.round(Number(item.price))
      })),
      cancelUrl,
      returnUrl
    };
    payload.signature = this.createSignature(payload);

    const response = await axios.post(`${PAYOS_BASE_URL}/v2/payment-requests`, payload, {
      headers: buildHeaders()
    });

    if (response.data?.code !== '00') {
      const error = new Error(response.data?.desc || 'Could not create PayOS payment link');
      error.statusCode = 502;
      throw error;
    }

    return response.data.data;
  },

  async getPaymentRequest(id) {
    const response = await axios.get(`${PAYOS_BASE_URL}/v2/payment-requests/${id}`, {
      headers: buildHeaders()
    });

    if (response.data?.code !== '00') {
      const error = new Error(response.data?.desc || 'Could not fetch PayOS payment request');
      error.statusCode = 502;
      throw error;
    }

    return response.data.data;
  }
};
