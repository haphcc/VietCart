import axios from 'axios';

const baseURL = process.env.USER_SERVICE_URL || 'http://localhost:3006';

export const userClient = {
  async getById(userId) {
    const response = await axios.get(`${baseURL}/users/${userId}`, { timeout: 5000 });
    return response.data;
  }
};
