import axios from 'axios';

const baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';

export const notificationClient = {
  async create(payload) {
    const response = await axios.post(`${baseURL}/notifications`, payload);
    return response.data;
  }
};

