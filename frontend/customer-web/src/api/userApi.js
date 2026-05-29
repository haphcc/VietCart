import axiosClient from './axiosClient.js';
import { getAuthHeaders } from '../utils/authStorage.js';

export const userApi = {
  register: (payload) => axiosClient.post('/users/register', payload),
  login: (payload) => axiosClient.post('/users/login', payload),
  me: () => axiosClient.get('/users/me', { headers: getAuthHeaders() }),
  updateMe: (payload) => axiosClient.patch('/users/me', payload, { headers: getAuthHeaders() }),
  getById: (id) => axiosClient.get(`/users/${id}`)
};
