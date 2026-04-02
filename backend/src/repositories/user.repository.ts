// ============================================
// User Repository - Database operations for User model
// Yeh file sirf database se baat karti hai - business logic yahan nahi hogi
// ============================================

import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Naya user create karne ka function
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // Prisma se database mein naya user insert karo
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });
  logger.debug(`Naya user create hua: ${user.email}`);
  return user;
};

// Email se user dhundho - login ke time use hota hai
export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

// User ID se user dhundho
export const findUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // Password select nahi kar rahe security ke liye
    },
  });
  return user;
};
