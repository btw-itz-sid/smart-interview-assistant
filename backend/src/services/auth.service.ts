// ============================================
// Auth Service - Authentication ki business logic
// Register, Login aur Token management yahan hoti hai
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import * as userRepo from '../repositories/user.repository';
import { JwtPayload } from '../types';
import { ApiError, BadRequestError, UnauthorizedError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// ============================================
// Register - Naya user account create karo
// Password hash karke database mein save karta hai
// ============================================
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // Check karo ki is email se pehle se koi registered toh nahi
  const existingUser = await userRepo.findUserByEmail(data.email);

  if (existingUser) {
    throw new BadRequestError('An account with this email already exists - please login');
  }

  // Password ko hash karo - plain text mein kabhi save mat karo!
  // Salt rounds = 12 (security aur speed ka balance)
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // User create karo database mein
  const user = await userRepo.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  // JWT token generate karo naye user ke liye
  const token = generateToken({ userId: user.id, email: user.email });

  logger.info(`New user registered: ${user.email}`);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

// ============================================
// Login - Existing user ko authenticate karo
// Email password verify karke token deta hai
// ============================================
export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  // Email se user dhundho
  const user = await userRepo.findUserByEmail(data.email);

  if (!user) {
    // Security ke liye generic message do - batao mat ki email galat hai ya password
    throw new UnauthorizedError('Invalid email or password');
  }

  // Password compare karo - hash se match karo
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Login successful - token generate karo
  const token = generateToken({ userId: user.id, email: user.email });

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

// ============================================
// User profile nikalo - ID se
// ============================================
export const getUserProfile = async (userId: number) => {
  const user = await userRepo.findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ============================================
// JWT Token generate karne ka helper function
// User ID aur email encode karke token banata hai
// ============================================
const generateToken = (payload: JwtPayload): string => {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
  return token;
};
