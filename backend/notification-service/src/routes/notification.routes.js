import { Router } from 'express';
import {
  createNotification,
  deleteNotification,
  getNotificationsByUser,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../controllers/notification.controller.js';
import { authMiddleware, authorizeUserParam, requireInternalApiKey } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/user/:userId', authMiddleware, authorizeUserParam, getNotificationsByUser);
router.patch('/user/:userId/read-all', authMiddleware, authorizeUserParam, markAllNotificationsAsRead);
router.post('/', requireInternalApiKey, createNotification);
router.patch('/:id/read', authMiddleware, markNotificationAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;

