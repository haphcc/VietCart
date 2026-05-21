import { pool } from '../config/database.js';
import { emailService } from './email.service.js';

export const notificationService = {
  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC', [userId]);
    return rows;
  },

  async create(payload) {
    const { user_id: userId, title, message, email } = payload;
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, payload.type || 'system']
    );

    if (email) {
      await emailService.send(email, title, message);
    }

    return { id: result.insertId, ...payload };
  }
};

