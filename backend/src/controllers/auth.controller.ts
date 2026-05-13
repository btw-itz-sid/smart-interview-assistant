// ============================================
// Auth Controller - Authentication ke request handlers
// Register aur Login ke endpoints yahan handle hote hain
// ============================================

import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../models/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

// ============================================
// POST /api/auth/register - Naya user register karo
// Body mein name, email, password chahiye
// ============================================
export const register = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Register request received');

  // Step 1: Input validate karo Zod schema se
  const validatedData = registerSchema.parse(req.body);

  // Step 2: Auth service se user create karo
  const result = await authService.registerUser(validatedData);

  // Step 3: Success response bhejo with token
  sendResponse(res, 201, 'Registration successful!', result);
});

// ============================================
// POST /api/auth/login - User login karo
// Body mein email aur password chahiye
// ============================================
export const login = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Login request received');

  // Step 1: Input validate karo
  const validatedData = loginSchema.parse(req.body);

  // Step 2: Auth service se login karo
  const result = await authService.loginUser(validatedData);

  // Step 3: Success response with token
  sendResponse(res, 200, 'Login successful!', result);
});

// ============================================
// GET /api/auth/profile - Logged in user ki profile nikalo
// Auth middleware se user info milti hai
// ============================================
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Profile request received');

    // req.user auth middleware ne set kiya hai
    const userId = req.user!.userId;

    const user = await authService.getUserProfile(userId);

    sendResponse(res, 200, 'Profile data', user);
  }
);
