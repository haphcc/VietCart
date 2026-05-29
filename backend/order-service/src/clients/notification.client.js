import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';
const internalApiKey = process.env.INTERNAL_API_KEY;

export const notificationClient = {
  async create(payload) {
    const response = await axios.post(`${baseURL}/notifications`, payload, {
      headers: internalApiKey ? { 'x-internal-api-key': internalApiKey } : {}
    });
    return response.data;
  }
};
