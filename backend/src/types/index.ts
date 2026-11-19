// ============================================
// TypeScript Types / Interfaces
// Poori app mein use hone wale custom types yahan defined hain
// ============================================

import { Request } from 'express';

// JWT token ke andar jo data hota hai
export interface JwtPayload {
  userId: number;
  email: string;
}

// Authenticated request - jab user login hota hai toh
// request mein user ki info attach hoti hai
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Progress analytics ka response type
export interface ProgressAnalytics {
  totalInterviews: number;
  averageScore: number;
  topicWiseProgress: {
    topic: string;
    avgScore: number;
    totalAttempts: number;
  }[];
  recentInterviews: {
    id: number;
    topic: string;
    type?: string;
    score: number | null;
    createdAt: Date;
  }[];
}
