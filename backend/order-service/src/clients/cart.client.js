import axios from 'axios';

const baseURL = process.env.CART_SERVICE_URL || 'http://localhost:3002';

export const cartClient = {
  async clearByUser(userId) {
    await axios.delete(`${baseURL}/cart/user/${userId}`);
  }
};

