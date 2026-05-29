import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

export const orderClient = {
  async getById(orderId) {
    const response = await axios.get(`${baseURL}/orders/${orderId}`);
    return response.data;
  }
};
