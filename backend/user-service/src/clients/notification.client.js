import axios from 'axios';

const baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';

export const notificationClient = {
  async create(payload) {
    try {
      const response = await axios.post(`${baseURL}/notifications`, payload, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.warn(`Notification create skipped: ${error.message}`);
      return null;
    }
  }
};
