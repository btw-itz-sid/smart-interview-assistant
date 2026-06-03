// ============================================
// Server.ts - Application Entry Point
// Yeh file server start karti hai aur database connect karti hai
// `npm run dev` yahi file run karta hai
// ============================================

import app from './app';
import { config, validateEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

// ============================================
// Server Start Function
// Database connect karke server start karta hai
// ============================================
const startServer = async (): Promise<void> => {
  // Step 1: Environment variables validate karo
  validateEnv();

  // Step 2: Database se connect karo
  // Agar database nahi mila toh bhi server chalega (graceful handling)
  await connectDatabase();

  // Step 3: Express server start karo
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Health Check: http://localhost:${config.port}/api/health`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info('==========================================');
    logger.info('Available API Endpoints:');
    logger.info('  POST   /api/auth/register');
    logger.info('  POST   /api/auth/login');
    logger.info('  GET    /api/auth/profile');
    logger.info('  POST   /api/ai/generate-questions');
    logger.info('  POST   /api/ai/evaluate-answer');
    logger.info('  GET    /api/ai/chat-history');
    logger.info('  GET    /api/ai/interview/:id');
    logger.info('  POST   /api/ai/company-interview');
    logger.info('  POST   /api/ai/jd-interview');
    logger.info('  POST   /api/ai/hint');
    logger.info('  POST   /api/ai/behavioral');
    logger.info('  POST   /api/ai/behavioral/evaluate');
    logger.info('  GET    /api/progress/analytics');
    logger.info('  GET    /api/progress/topics');
    logger.info('  GET    /api/progress/streak');
    logger.info('  GET    /api/progress/badges');
    logger.info('  GET    /api/progress/readiness');
    logger.info('  POST   /api/resume/analyze');
    logger.info('  POST   /api/resume/upload');
    logger.info('  POST   /api/resume/generate');
    logger.info('  POST   /api/resume/ats-score');
    logger.info('==========================================');
  });

  // ============================================
  // Graceful Shutdown - Server band hone pe cleanup karo
  // ============================================

  // SIGTERM signal aane pe (e.g., Docker stop, Ctrl+C)
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} signal mila - server band ho raha hai...`);

    // Naye connections accept karna band karo
    server.close(async () => {
      // Database connection band karo
      await disconnectDatabase();
      logger.info('Server gracefully shut down.');
      process.exit(0);
    });

    // Agar 10 second mein band nahi hua toh force quit
    setTimeout(() => {
      logger.error('Forced shutdown - 10 second mein band nahi hua');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Unhandled errors catch karo taaki server crash na ho
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection:', { reason: reason?.message || reason });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    process.exit(1);
  });
};

// Server start karo!
startServer();
