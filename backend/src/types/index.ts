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

// Auth APIs ke liye request bodies
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

// Interview generate karne ke liye request body
export interface GenerateQuestionBody {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number; // Kitne questions chahiye
}

// User ka answer evaluate karne ke liye request body
export interface EvaluateAnswerBody {
  questionId: number;
  interviewId: number;
  question: string;
  answer: string;
  topic: string;
}

// Resume analyze karne ke liye request body
export interface ResumeAnalyzeBody {
  resumeText: string;
  jobRole?: string;
}

// AI service se jo response aata hai uska type
export interface AIResponse {
  content: string;
  tokensUsed?: number;
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
    score: number | null;
    createdAt: Date;
  }[];
}
