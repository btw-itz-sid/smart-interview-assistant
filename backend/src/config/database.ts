// ============================================
// Prisma Client Instance - Database se baat karne ke liye
// Singleton pattern use kiya hai taaki ek hi connection pool rahe
// ============================================

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Global mein prisma store karte hain taaki dev mein
// hot-reload pe naye naye connections na bane
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Agar pehle se instance hai toh wahi use karo, nahi toh naya banao
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

// Development mein global mein store karo
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection test karne ka function
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connection successful.');
  } catch (error) {
    logger.error('Database connection failed.', error);
    // Agar database connect nahi hua toh bhi app chalegi
    // Bas database wale features kaam nahi karenge
    logger.warn('App running without database - some features may not work.');
  }
};

// Graceful shutdown ke liye disconnect function
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database connection band ho gaya');
};
