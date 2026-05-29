import axiosClient from './axiosClient.js';

export const paymentApi = {
  create: (payload) => axiosClient.post('/payments', payload),
  getByOrder: (orderId) => axiosClient.get(`/payments/order/${orderId}`),
  syncPayosStatus: (orderId) => axiosClient.post(`/payments/payos/order/${orderId}/sync`)
};
