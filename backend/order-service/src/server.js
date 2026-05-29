import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import orderRoutes from './routes/order.routes.js';
import { loadEnv } from '../../shared/config/loadEnv.js';

loadEnv();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'ok' });
});

app.use('/orders', orderRoutes);

app.listen(port, () => {
  console.log(`Order Service running on port ${port}`);
});
