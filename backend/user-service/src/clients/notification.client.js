import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';
const internalApiKey = process.env.INTERNAL_API_KEY;

export const notificationClient = {
  async create(payload) {
    try {
      const response = await axios.post(`${baseURL}/notifications`, payload, {
        timeout: 5000,
        headers: internalApiKey ? { 'x-internal-api-key': internalApiKey } : {}
      });
      return response.data;
    } catch (error) {
      console.warn(`Notification create skipped: ${error.message}`);
      return null;
    }
  }
};
