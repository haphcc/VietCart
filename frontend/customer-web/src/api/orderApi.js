import axiosClient from './axiosClient.js';

export const orderApi = {
  getByUser: (userId) => axiosClient.get(`/orders/user/${userId}`),
  create: (payload) => axiosClient.post('/orders', payload),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  getOrderItems: (orderId) => axiosClient.get(`/orders/${orderId}/items`),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status })
};

