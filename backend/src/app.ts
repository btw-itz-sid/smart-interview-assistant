// ============================================
// App.ts - Express Application Setup
// Yeh file Express app configure karti hai
// Saare middlewares aur routes yahan mount hote hain
// ============================================

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

// Routes import karo
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import progressRoutes from './routes/progress.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';

// Middlewares import karo
import { errorHandler } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import { logger } from './utils/logger';

// Swagger docs import karo
import { swaggerSpec } from './docs/swagger';

// Express app banao
const app = express();

// ============================================
// Global Middlewares - Saari requests pe lagne wale
// ============================================

// Helmet - Security headers set karta hai (XSS, clickjacking se protection)
// Swagger UI ke liye content-security-policy temporarily relax karo
app.use(
  helmet({
    contentSecurityPolicy: false, // Swagger UI ke liye
  })
);

// CORS — supports FRONTEND_URL env var; multiple origins via comma-separation
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// JSON body parser - request body ko parse karta hai
app.use(express.json({ limit: '10mb' })); // 10MB limit for resume text etc.

// URL encoded data parser
app.use(express.urlencoded({ extended: true }));

// General rate limiter - saari routes pe lagega
app.use(generalLimiter);

// Request logging middleware - har request log karo
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================
// Swagger UI - API Documentation
// http://localhost:5000/api/docs pe access karo
// ============================================
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Smart Interview API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
    swaggerOptions: {
      persistAuthorization: true, // Token refresh ke baad bhi saved rahe
    },
  })
);

// Swagger JSON spec endpoint (for tools like Postman)
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// API Routes - Saare route groups yahan mount hote hain
// ============================================

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    docs: 'http://localhost:5000/api/docs',
  });
});

// Auth routes - /api/auth/*
app.use('/api/auth', authRoutes);

// AI Mock Interview routes - /api/ai/*
app.use('/api/ai', aiRoutes);

// Interview session routes - /api/interview/*
app.use('/api/interview', interviewRoutes);

// Progress & Analytics routes - /api/progress/*
app.use('/api/progress', progressRoutes);

// Resume Analyzer routes - /api/resume/*
app.use('/api/resume', resumeRoutes);

// ============================================
// 404 Handler - Koi route match nahi hua
// ============================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Yeh route exist nahi karta - URL check karo',
    tip: 'API docs ke liye: /api/docs',
  });
});

// ============================================
// Global Error Handler - Last mein lagta hai
// ============================================
app.use(errorHandler);

export default app;