import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import notificationRoutes from './routes/notification.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'ok' });
});

app.use('/notifications', notificationRoutes);

app.listen(port, () => {
  console.log(`Notification Service running on port ${port}`);
});

