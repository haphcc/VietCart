import axiosClient from './axiosClient.js';
import { getAuthHeaders } from '../utils/authStorage.js';

export const orderApi = {
  getAll: () => axiosClient.get('/orders', { headers: getAuthHeaders() }),
  getByUser: (userId) => axiosClient.get(`/orders/user/${userId}`),
  create: (payload) => axiosClient.post('/orders', payload),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  getOrderItems: (orderId) => axiosClient.get(`/orders/${orderId}/items`),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }, { headers: getAuthHeaders() })
};

