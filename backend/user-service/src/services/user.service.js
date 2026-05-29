import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { notificationClient } from '../clients/notification.client.js';
import { signUserToken } from './token.service.js';

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toPublicUser(row) {
  if (!row) return null;
  const { password_hash: _passwordHash, ...user } = row;
  return user;
}

function validateRegisterPayload(payload) {
  const name = String(payload.name || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');

  if (!name) throw createError(400, 'Name is required');
  if (!email || !email.includes('@')) throw createError(400, 'Valid email is required');
  if (password.length < 6) throw createError(400, 'Password must be at least 6 characters');

  return {
    name,
    email,
    password,
    phone: payload.phone ? String(payload.phone).trim() : null,
    address: payload.address ? String(payload.address).trim() : null
  };
}

export const userService = {
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, role, is_active, created_at, updated_at FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );
    return rows[0] || null;
  },

  async register(payload) {
    const data = validateRegisterPayload(payload);
    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existingRows.length > 0) throw createError(409, 'Email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.email, passwordHash, data.phone, data.address, 'customer']
    );

    const user = await this.findById(result.insertId);
    const token = signUserToken(user);

    await notificationClient.create({
      user_id: user.id,
      title: 'Welcome to VietCart',
      message: 'Your VietCart account has been created successfully.',
      type: 'system',
      email: user.email
    });

    return { user, token };
  },

  async login(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || '');
    if (!email || !password) throw createError(400, 'Email and password are required');

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const userRow = rows[0];
    if (!userRow || !userRow.is_active) throw createError(401, 'Invalid email or password');

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) throw createError(401, 'Invalid email or password');

    const user = toPublicUser(userRow);
    const token = signUserToken(user);
    return { user, token };
  },

  async updateProfile(id, payload) {
    const allowed = {
      name: payload.name,
      phone: payload.phone,
      address: payload.address
    };

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(allowed)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value === null ? null : String(value).trim());
      }
    }

    if (fields.length === 0) throw createError(400, 'No profile fields to update');

    values.push(id);
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND is_active = TRUE`,
      values
    );

    if (result.affectedRows === 0) throw createError(404, 'User not found');

    const user = await this.findById(id);
    await notificationClient.create({
      user_id: user.id,
      title: 'Hồ sơ đã được cập nhật',
      message: 'Thông tin hồ sơ VietCart của bạn vừa được cập nhật.',
      type: 'system',
      email: user.email
    });

    return user;
  },

  async changePassword(id, payload) {
    const currentPassword = String(payload.current_password || '');
    const newPassword = String(payload.new_password || '');
    const confirmPassword = String(payload.confirm_password || '');

    if (!currentPassword) throw createError(400, 'Mật khẩu hiện tại là bắt buộc');
    if (newPassword.length < 6) throw createError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) throw createError(400, 'Xác nhận mật khẩu không khớp');

    const [rows] = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );
    const user = rows[0];
    if (!user) throw createError(404, 'Không tìm thấy người dùng');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw createError(401, 'Mật khẩu hiện tại không đúng');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

    const publicUser = await this.findById(id);
    await notificationClient.create({
      user_id: publicUser.id,
      title: 'Mật khẩu đã được đổi',
      message: 'Mật khẩu đăng nhập VietCart của bạn vừa được cập nhật.',
      type: 'system',
      email: publicUser.email
    });

    return { message: 'Mật khẩu đã được cập nhật' };
  }
};
