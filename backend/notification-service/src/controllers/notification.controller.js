import { notificationService } from '../services/notification.service.js';

export async function getNotificationsByUser(req, res, next) {
  try {
    const notifications = await notificationService.findByUser(req.params.userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function createNotification(req, res, next) {
  try {
    const notification = await notificationService.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
}

