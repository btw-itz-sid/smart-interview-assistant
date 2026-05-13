// ============================================
// Auth Middleware - JWT Authentication
// Yeh middleware check karta hai ki user logged in hai ya nahi
// Token verify karke user info request mein attach karta hai
// ============================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// Auth middleware function
// Protected routes pe lagta hai - bina token ke access nahi milega
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Authorization header se token nikalo
    // Format hota hai: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token missing - please login first');
    }

    // "Bearer " ke baad wala part token hai
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    // Token verify karo - agar expired ya tampered hai toh error aayega
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Verified user info request mein attach karo
    // Ab aage ke controllers mein req.user se user ki info mil jaayegi
    req.user = decoded;

    logger.debug(`User authenticated: ${decoded.email}`);

    // Aage jaao next middleware ya controller pe
    next();
  } catch (error) {
    // Agar token invalid hai ya expire ho gaya
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token - please login again'));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired - please login again'));
      return;
    }
    next(error);
  }
};
