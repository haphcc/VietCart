import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const internalApiKey = process.env.INTERNAL_API_KEY;

function internalHeaders() {
  return internalApiKey ? { 'x-internal-api-key': internalApiKey } : {};
}

export const orderClient = {
  async getById(orderId) {
    const response = await axios.get(`${baseURL}/orders/${orderId}`);
    return response.data;
  },

  async updateStatus(orderId, status) {
    const response = await axios.put(
      `${baseURL}/orders/${orderId}/status`,
      { status },
      { headers: internalHeaders() }
    );
    return response.data;
  }
};
