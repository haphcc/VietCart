import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const internalApiKey = process.env.INTERNAL_API_KEY;

function internalHeaders() {
  return internalApiKey ? { 'x-internal-api-key': internalApiKey } : {};
}

export const productClient = {
  async getById(productId) {
    const response = await axios.get(`${baseURL}/products/${productId}`);
    return response.data;
  },
  
  async syncStock(items) {
    const response = await axios.post(`${baseURL}/products/sync-stock`, { items }, { headers: internalHeaders() });
    return response.data;
  },

  async reserveStock(items, orderId = null) {
    const response = await axios.post(
      `${baseURL}/products/reserve-stock`,
      { items, order_id: orderId },
      { headers: internalHeaders() }
    );
    return response.data;
  },

  async confirmReservation(reservationIds) {
    const response = await axios.post(
      `${baseURL}/products/confirm-reservation`,
      { reservation_ids: reservationIds },
      { headers: internalHeaders() }
    );
    return response.data;
  },

  async releaseReservation(reservationIds) {
    const response = await axios.post(
      `${baseURL}/products/release-reservation`,
      { reservation_ids: reservationIds },
      { headers: internalHeaders() }
    );
    return response.data;
  }
};
