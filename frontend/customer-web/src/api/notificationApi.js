import axiosClient from './axiosClient.js';

export const notificationApi = {
  getByUser: (userId) => axiosClient.get(`/notifications/user/${userId}`)
};

