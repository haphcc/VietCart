import { Router } from 'express';
import {
  createNotification,
  deleteNotification,
  getNotificationsByUser,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/user/:userId', getNotificationsByUser);
router.patch('/user/:userId/read-all', markAllNotificationsAsRead);
router.post('/', createNotification);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

export default router;

