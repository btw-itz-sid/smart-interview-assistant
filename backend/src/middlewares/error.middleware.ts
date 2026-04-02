// ============================================
// Error Handler Middleware
// Poori app ka centralized error handler hai yeh
// Koi bhi error aaye toh yahan aake handle hota hai
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

// Global error handling middleware
// Express mein 4 parameters wala middleware error handler hota hai
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Error ko log karo taaki debugging easy ho
  logger.error(`Error aaya: ${err.message}`, {
    stack: err.stack,
    name: err.name,
  });

  // Agar yeh humara custom ApiError hai toh uska statusCode use karo
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Agar Zod validation error hai toh 400 Bad Request bhejo
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation fail ho gayi - data check karo',
      errors: formattedErrors,
    });
    return;
  }

  // Unknown errors ke liye 500 Internal Server Error bhejo
  res.status(500).json({
    success: false,
    message: 'Server mein kuch gadbad ho gayi - thodi der baad try karo',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
