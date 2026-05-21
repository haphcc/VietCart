import { Router } from 'express';
import { createNotification, getNotificationsByUser } from '../controllers/notification.controller.js';

const router = Router();

router.get('/user/:userId', getNotificationsByUser);
router.post('/', createNotification);

export default router;

