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
  }
};

