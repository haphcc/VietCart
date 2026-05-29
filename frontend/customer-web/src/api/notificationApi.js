import axiosClient from './axiosClient.js';
import { getAuthHeaders } from '../utils/authStorage.js';

export const notificationApi = {
  getByUser: (userId) => axiosClient.get(`/notifications/user/${userId}`, { headers: getAuthHeaders() }),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/read`, {}, { headers: getAuthHeaders() }),
  markAllRead: (userId) => axiosClient.patch(`/notifications/user/${userId}/read-all`, {}, { headers: getAuthHeaders() }),
  remove: (id) => axiosClient.delete(`/notifications/${id}`, { headers: getAuthHeaders() })
};

