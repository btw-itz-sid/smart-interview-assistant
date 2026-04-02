// ============================================
// AI Interview Routes - /api/ai/*
// Mock interview generation aur evaluation ke routes
// ============================================

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { generateQuestionSchema, evaluateAnswerSchema } from '../models/validation';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  generateQuestions,
  evaluateAnswer,
  getChatHistory,
  getInterviewDetail,
} from '../controllers/ai.controller';

const router = Router();

// Sabhi AI routes ke liye auth required hai
router.use(authMiddleware);

// POST /api/ai/generate-questions - Interview start karo
router.post('/generate-questions', validateBody(generateQuestionSchema), generateQuestions);

// POST /api/ai/evaluate-answer - Answer evaluate karo
router.post('/evaluate-answer', validateBody(evaluateAnswerSchema), evaluateAnswer);

// GET /api/ai/chat-history - Saari interview history (5min cache)
router.get('/chat-history', cacheMiddleware(300), getChatHistory);

// GET /api/ai/interview/:id - Specific interview ki detail
router.get('/interview/:id', getInterviewDetail);

export default router;
