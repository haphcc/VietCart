import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import { loadEnv } from '../../shared/config/loadEnv.js';

loadEnv();

const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'user-service', status: 'ok' });
});

app.use('/users', userRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});
