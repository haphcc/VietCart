import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import notificationRoutes from './routes/notification.routes.js';
import { loadEnv } from '../../shared/config/loadEnv.js';

loadEnv();

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'ok' });
});

app.use('/notifications', notificationRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Notification Service running on port ${port}`);
});

