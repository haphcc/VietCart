import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import productRoutes from './routes/product.routes.js';
import { loadEnv } from '../../shared/config/loadEnv.js';
import { productService } from './services/product.service.js';

loadEnv();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'product-service', status: 'ok' });
});

app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Product Service running on port ${port}`);

  // Clean up expired stock reservations every 60 seconds
  setInterval(() => {
    productService.cleanupExpiredReservations();
  }, 60_000);
});
