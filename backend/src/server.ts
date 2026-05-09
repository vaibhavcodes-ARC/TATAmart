import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import analyticsRoutes from './routes/analytics.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import rfqRoutes from './routes/rfq.routes';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { initializeElasticsearch } from './utils/elasticsearch';

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rfqs', rfqRoutes);

app.get('/', (req, res) => {
  res.send('TATAmart Backend API is running...');
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  try {
    await initializeElasticsearch();
  } catch (esErr) {
    console.warn('[ELASTICSEARCH] Failed to initialize cluster, but backend server is successfully listening on port:', port);
  }
  // Keep event loop alive
  setInterval(() => {}, 1000);
});
