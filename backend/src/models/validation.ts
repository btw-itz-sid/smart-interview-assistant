// ============================================
// Zod Validation Schemas
// Input validation ke liye schemas - galat data server tak aane se pehle hi rok dega
// ============================================

import { z } from 'zod';

// Register karte waqt validation
// Name, email aur password sab required hain
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Naam kam se kam 2 characters ka hona chahiye')
    .max(100, 'Naam 100 characters se zyada nahi ho sakta'),
  email: z
    .string()
    .email('Valid email dalo bhai'),
  password: z
    .string()
    .min(6, 'Password kam se kam 6 characters ka hona chahiye')
    .max(100, 'Password 100 characters se zyada nahi ho sakta'),
});

// Login karte waqt validation
export const loginSchema = z.object({
  email: z.string().email('Valid email dalo bhai'),
  password: z.string().min(1, 'Password dena zaroori hai'),
});

// Interview question generate karte waqt validation
export const generateQuestionSchema = z.object({
  topic: z
    .string()
    .min(2, 'Topic kam se kam 2 characters ka hona chahiye')
    .max(200, 'Topic 200 characters se zyada nahi ho sakta'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .optional()
    .default('medium'),
  count: z
    .number()
    .int()
    .min(1, 'Kam se kam 1 question toh chahiye')
    .max(10, 'Ek baar mein max 10 questions')
    .optional()
    .default(3),
});

// Answer evaluate karte waqt validation
export const evaluateAnswerSchema = z.object({
  questionId: z.number().int().positive('Question ID positive honi chahiye'),
  interviewId: z.number().int().positive('Interview ID positive honi chahiye'),
  question: z.string().min(1, 'Question dena zaroori hai'),
  answer: z.string().min(1, 'Answer dena zaroori hai bhai'),
  topic: z.string().min(1, 'Topic dena zaroori hai'),
});

// Resume analyze karte waqt validation
export const resumeAnalyzeSchema = z.object({
  resumeText: z
    .string()
    .min(50, 'Resume text kam se kam 50 characters ka hona chahiye'),
  jobRole: z
    .string()
    .max(200, 'Job role 200 characters se zyada nahi ho sakta')
    .optional(),
});
