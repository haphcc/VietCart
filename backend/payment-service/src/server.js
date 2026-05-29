import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import paymentRoutes from './routes/payment.routes.js';
import { loadEnv } from '../../shared/config/loadEnv.js';

loadEnv();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'payment-service', status: 'ok' });
});

app.use('/payments', paymentRoutes);

app.listen(port, () => {
  console.log(`Payment Service running on port ${port}`);
});
