import axiosClient from './axiosClient.js';
import { getAuthHeaders } from '../utils/authStorage.js';

export const userApi = {
  register: (payload) => axiosClient.post('/users/register', payload),
  login: (payload) => axiosClient.post('/users/login', payload),
  me: () => axiosClient.get('/users/me', { headers: getAuthHeaders() }),
  updateMe: (payload) => axiosClient.patch('/users/me', payload, { headers: getAuthHeaders() }),
  changePassword: (payload) => axiosClient.patch('/users/me/password', payload, { headers: getAuthHeaders() }),
  getById: (id) => axiosClient.get(`/users/${id}`, { headers: getAuthHeaders() }),
  adminList: () => axiosClient.get('/users/admin/users', { headers: getAuthHeaders() }),
  adminCreate: (payload) => axiosClient.post('/users/admin/users', payload, { headers: getAuthHeaders() }),
  adminUpdate: (id, payload) => axiosClient.patch(`/users/admin/users/${id}`, payload, { headers: getAuthHeaders() }),
  adminDelete: (id) => axiosClient.delete(`/users/admin/users/${id}`, { headers: getAuthHeaders() })
};
