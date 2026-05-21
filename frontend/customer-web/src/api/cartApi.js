import axiosClient from './axiosClient.js';

export const cartApi = {
  getByUser: (userId) => axiosClient.get(`/cart/${userId}`),
  addItem: (payload) => axiosClient.post('/cart/items', payload),
  removeItem: (itemId) => axiosClient.delete(`/cart/items/${itemId}`)
};

