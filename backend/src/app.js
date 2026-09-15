import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Trust reverse proxies (Render, Cloudflare, Vercel) for accurate client IP detection
app.set('trust proxy', 1);

// Security Headers with Helmet (configured for cross-origin API access)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Cross-Origin Resource Sharing (CORS) Configuration
// Allows Vercel, Render, Localhost, and configured frontend origins
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;
  // Always allow during development
  if (env.NODE_ENV === 'development') return true;
  // Allow any Vercel domain (production and preview branches)
  if (origin.endsWith('.vercel.app') || /^https:\/\/([a-z0-9-]+-)*[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }
  // Allow Render services
  if (origin.endsWith('.onrender.com')) return true;
  // Allow Netlify and GitHub Pages
  if (origin.endsWith('.netlify.app') || origin.endsWith('.github.io')) return true;
  // Allow localhost / 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Allow explicit FRONTEND_URL or comma-separated ALLOWED_ORIGINS
  if (env.FRONTEND_URL && origin === env.FRONTEND_URL) return true;
  if (process.env.ALLOWED_ORIGINS) {
    const list = process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (list.includes(origin) || list.includes('*')) return true;
  }
  // Allow all origins by default for public detection & auth operations
  return true;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// HTTP Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Global API Rate Limiting (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in a few minutes.'
  }
});
app.use('/api', apiLimiter);

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Fake Job Detection API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
