import axiosClient from './axiosClient.js';

export const cartApi = {
  getByUser: (userId) => axiosClient.get(`/cart/${userId}`),
  addItem: (payload) => axiosClient.post('/cart/items', payload),
  updateQuantity: (payload) => axiosClient.patch('/cart/items', payload),
  removeItem: (itemId) => axiosClient.delete(`/cart/items/${itemId}`),
  clearByUser: (userId) => axiosClient.delete(`/cart/user/${userId}`)
};
