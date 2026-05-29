import axiosClient from './axiosClient.js';

export const notificationApi = {
  getByUser: (userId) => axiosClient.get(`/notifications/user/${userId}`),
  create: (payload) => axiosClient.post('/notifications', payload),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: (userId) => axiosClient.patch(`/notifications/user/${userId}/read-all`),
  remove: (id) => axiosClient.delete(`/notifications/${id}`)
};

