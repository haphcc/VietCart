import axiosClient from './axiosClient.js';
import { getAuthHeaders } from '../utils/authStorage.js';

export const productApi = {
  getAll: () => axiosClient.get('/products'),
  getById: (id) => axiosClient.get(`/products/${id}`),
  create: (payload) => axiosClient.post('/products', payload, { headers: getAuthHeaders() }),
  update: (id, payload) => axiosClient.patch(`/products/${id}`, payload, { headers: getAuthHeaders() }),
  remove: (id) => axiosClient.delete(`/products/${id}`, { headers: getAuthHeaders() })
};

