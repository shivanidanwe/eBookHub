import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import prisma from './prisma/client';

// Route imports
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import categoryRoutes from './routes/category.routes';
import authorRoutes from './routes/author.routes';
import userRoutes from './routes/user.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import libraryRoutes from './routes/library.routes';
import reviewRoutes from './routes/review.routes';
import authorPortalRoutes from './routes/authorPortal.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import supportRoutes from './routes/support.routes';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static public files (Public covers and public previews only)
// Full PDFs are strictly NOT served statically to prevent unauthorized direct URL downloads!
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads/covers', express.static(path.join(uploadsPath, 'covers')));
app.use('/uploads/previews', express.static(path.join(uploadsPath, 'previews')));

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'healthy',
      service: 'eBookHub API',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: 'connected',
      paymentProvider: config.paymentProvider,
    });
  } catch {
    return res.status(503).json({
      status: 'degraded',
      service: 'eBookHub API',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: 'unavailable',
      paymentProvider: config.paymentProvider,
    });
  }
});

// Swagger API specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'eBookHub REST API',
    version: '1.0.0',
    description: 'API documentation for eBookHub - Educational eBook Marketplace platform in India',
  },
  servers: [{ url: config.apiUrl }],
  paths: {
    '/api/health': { get: { summary: 'System Health Check' } },
    '/api/auth/login': { post: { summary: 'User and Author Login' } },
    '/api/books': { get: { summary: 'Discover Educational eBooks' } },
    '/api/cart': { get: { summary: 'User Shopping Cart' } },
    '/api/orders/create': { post: { summary: 'Create Checkout Order' } },
    '/api/payments/verify': { post: { summary: 'Verify Payment and Entitlement Grant' } },
    '/api/library': { get: { summary: 'User Digital Library' } },
    '/api/author/dashboard': { get: { summary: 'Author Analytics & Sales' } },
    '/api/admin/dashboard': { get: { summary: 'Admin Metrics & Platform Management' } },
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/author', authorPortalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
