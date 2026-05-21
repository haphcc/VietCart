import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cartRoutes from './routes/cart.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ service: 'cart-service', status: 'ok' });
});

app.use('/cart', cartRoutes);

app.listen(port, () => {
  console.log(`Cart Service running on port ${port}`);
});

