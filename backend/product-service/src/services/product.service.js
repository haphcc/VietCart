import { pool } from '../config/database.js';

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeProductPayload(payload, { partial = false } = {}) {
  const data = {};

  if (!partial || payload.name !== undefined) {
    data.name = String(payload.name || '').trim();
    if (!data.name) throw createError(400, 'Product name is required');
  }

  if (!partial || payload.description !== undefined) {
    data.description = payload.description === undefined || payload.description === null
      ? null
      : String(payload.description).trim();
  }

  if (!partial || payload.price !== undefined) {
    data.price = Number(payload.price);
    if (!Number.isFinite(data.price) || data.price < 0) {
      throw createError(400, 'Product price must be greater than or equal to 0');
    }
  }

  if (!partial || payload.stock !== undefined) {
    data.stock = Number(payload.stock);
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      throw createError(400, 'Product stock must be a non-negative integer');
    }
  }

  if (!partial || payload.image_url !== undefined) {
    data.image_url = payload.image_url ? String(payload.image_url).trim() : null;
  }

  return data;
}

export const productService = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  async create(payload) {
    const data = normalizeProductPayload(payload);
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.description, data.price, data.stock, data.image_url]
    );
    return this.findById(result.insertId);
  },

  async update(id, payload) {
    const data = normalizeProductPayload(payload, { partial: true });
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) throw createError(400, 'No product fields to update');

    values.push(id);
    const [result] = await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) throw createError(404, 'Product not found');
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async syncStock(items) {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();

      // Sort items by product_id to prevent deadlocks when locking multiple rows
      const sortedItems = [...items].sort((a, b) => a.product_id - b.product_id);

      for (const item of sortedItems) {
        // SELECT FOR UPDATE locks the row so no other transaction can read/write until we commit
        const [rows] = await connection.query(
          'SELECT stock, name FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (rows.length === 0) {
          throw new Error(`Product ID ${item.product_id} not found`);
        }

        const product = rows[0];
        if (product.stock < item.quantity) {
          throw new Error(`Product "${product.name}" does not have enough stock. Available: ${product.stock}, Required: ${item.quantity}`);
        }

        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      committed = true;
      return { success: true, message: 'Stock synchronized successfully' };
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async reserveStock(items, orderId = null) {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();

      const sortedItems = items
        .map((item, originalIndex) => ({ ...item, originalIndex }))
        .sort((a, b) => Number(a.product_id) - Number(b.product_id));
      const orderedReservationIds = new Array(items.length);
      const orderedReservedItems = new Array(items.length);

      for (const item of sortedItems) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product ID ${item.product_id}`);
        }

        const [rows] = await connection.query(
          'SELECT stock, name, price FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (rows.length === 0) {
          throw new Error(`Product ID ${item.product_id} not found`);
        }

        const product = rows[0];
        if (product.stock < item.quantity) {
          throw new Error(`Product "${product.name}" does not have enough stock. Available: ${product.stock}, Required: ${item.quantity}`);
        }

        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [quantity, item.product_id]
        );

        const [result] = await connection.query(
          'INSERT INTO stock_reservations (product_id, quantity, order_id, status, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
          [item.product_id, quantity, orderId, 'reserved']
        );

        orderedReservationIds[item.originalIndex] = result.insertId;
        orderedReservedItems[item.originalIndex] = {
          product_id: item.product_id,
          quantity,
          price: product.price,
          name: product.name
        };
      }

      await connection.commit();
      committed = true;

      return {
        reservationIds: orderedReservationIds,
        reservedItems: orderedReservedItems,
        message: 'Stock reserved successfully'
      };
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async confirmReservation(reservationIds) {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();

      // Check if all requested reservations exist and are not already released
      const [rows] = await connection.query(
        'SELECT id, status, expires_at FROM stock_reservations WHERE id IN (?) FOR UPDATE',
        [reservationIds]
      );

      if (rows.length < reservationIds.length) {
        throw new Error('Some stock reservations do not exist');
      }

      for (const row of rows) {
        if (row.status === 'released') {
          throw new Error('One or more stock reservations have already expired and been released');
        }
        if (row.status === 'reserved' && new Date(row.expires_at).getTime() < Date.now()) {
          throw new Error('One or more stock reservations have expired');
        }
      }

      // Update any that are still 'reserved' to 'confirmed'
      await connection.query(
        'UPDATE stock_reservations SET status = ? WHERE id IN (?) AND status = ?',
        ['confirmed', reservationIds, 'reserved']
      );

      await connection.commit();
      committed = true;
      return { success: true, message: 'Reservations confirmed successfully' };
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async releaseReservation(reservationIds) {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();

      // Fetch reservations sorted by product_id to avoid deadlocks, including confirmed ones
      const [reservations] = await connection.query(
        'SELECT id, product_id, quantity FROM stock_reservations WHERE id IN (?) AND status IN (?, ?) ORDER BY product_id ASC FOR UPDATE',
        [reservationIds, 'reserved', 'confirmed']
      );

      for (const reservation of reservations) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [reservation.quantity, reservation.product_id]
        );

        await connection.query(
          'UPDATE stock_reservations SET status = ? WHERE id = ?',
          ['released', reservation.id]
        );
      }

      await connection.commit();
      committed = true;
      return { success: true, message: 'Reservations released successfully' };
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async cleanupExpiredReservations() {
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();

      const [expiredReservations] = await connection.query(
        'SELECT id, product_id, quantity FROM stock_reservations WHERE status = ? AND expires_at < NOW() ORDER BY product_id ASC FOR UPDATE',
        ['reserved']
      );

      if (expiredReservations.length === 0) {
        await connection.commit();
        committed = true;
        return;
      }

      for (const reservation of expiredReservations) {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [reservation.quantity, reservation.product_id]
        );

        await connection.query(
          'UPDATE stock_reservations SET status = ? WHERE id = ?',
          ['released', reservation.id]
        );
      }

      await connection.commit();
      committed = true;
      console.log(`Cleaned up ${expiredReservations.length} expired reservation(s)`);
    } catch (error) {
      if (!committed) {
        await connection.rollback();
      }
      console.error('Error cleaning up expired reservations:', error.message);
    } finally {
      connection.release();
    }
  }
};

