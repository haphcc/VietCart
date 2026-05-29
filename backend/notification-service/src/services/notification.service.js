import { pool } from '../config/database.js';
import { emailService } from './email.service.js';

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validatePayload(payload) {
  const userId = Number(payload.user_id);
  const title = String(payload.title || '').trim();
  const message = String(payload.message || '').trim();
  const type = payload.type || 'system';

  if (!Number.isInteger(userId) || userId <= 0) throw createError(400, 'Valid user_id is required');
  if (!title) throw createError(400, 'Title is required');
  if (!message) throw createError(400, 'Message is required');

  return { userId, title, message, type };
}

export const notificationService = {
  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read ASC, id DESC',
      [userId]
    );
    return rows;
  },

  async create(payload) {
    const { userId, title, message, type } = validatePayload(payload);
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );

    const emailStatus = await emailService.send(payload.email, title, message);

    return {
      id: result.insertId,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      email_status: emailStatus
    };
  },

  async markAsRead(id, actor) {
    const params = actor?.role === 'admin' ? [id] : [id, actor?.id];
    const ownerClause = actor?.role === 'admin' ? '' : ' AND user_id = ?';
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ?${ownerClause}`,
      params
    );
    if (result.affectedRows === 0) return null;

    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE id = ?${ownerClause}`,
      params
    );
    return rows[0] || null;
  },

  async markAllAsRead(userId) {
    const [result] = await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return { updated: result.affectedRows };
  },

  async delete(id, actor) {
    const params = actor?.role === 'admin' ? [id] : [id, actor?.id];
    const ownerClause = actor?.role === 'admin' ? '' : ' AND user_id = ?';
    const [result] = await pool.query(`DELETE FROM notifications WHERE id = ?${ownerClause}`, params);
    return result.affectedRows > 0;
  }
};

