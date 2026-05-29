import axios from 'axios';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

const baseURL = process.env.USER_SERVICE_URL || 'http://localhost:3006';
const internalApiKey = process.env.INTERNAL_API_KEY;

export const userClient = {
  async getById(userId) {
    const response = await axios.get(`${baseURL}/users/${userId}`, {
      timeout: 5000,
      headers: internalApiKey ? { 'x-internal-api-key': internalApiKey } : {}
    });
    return response.data;
  }
};
