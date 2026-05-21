import axiosClient from './axiosClient.js';

export const orderApi = {
  getByUser: (userId) => axiosClient.get(`/orders/user/${userId}`),
  create: (payload) => axiosClient.post('/orders', payload)
};

