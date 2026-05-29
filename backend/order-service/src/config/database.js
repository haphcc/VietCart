import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { loadEnv } from '../../../shared/config/loadEnv.js';

loadEnv();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vietcart_order',
  waitForConnections: true,
  connectionLimit: 10
});
