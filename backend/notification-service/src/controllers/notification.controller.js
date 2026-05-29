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

export async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    return res.json(notification);
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.params.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const deleted = await notificationService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

