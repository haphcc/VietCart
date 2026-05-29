import { pool } from '../config/database.js';

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
    const { name, description, price, stock, image_url: imageUrl } = payload;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock, imageUrl]
    );
    return { id: result.insertId, ...payload };
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
  }
};

