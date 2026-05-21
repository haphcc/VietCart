import axios from 'axios';

const baseURL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

export const productClient = {
  async getById(productId) {
    const response = await axios.get(`${baseURL}/products/${productId}`);
    return response.data;
  }
};

