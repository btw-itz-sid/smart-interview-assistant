// ============================================
// AI Interview Routes — /api/ai/*
// Mock interview, hints, behavioral, company, JD routes
// ============================================

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  behavioralEvaluateSchema,
  behavioralInterviewSchema,
  companyInterviewSchema,
  evaluateAnswerSchema,
  generateQuestionSchema,
  hintSchema,
  jdInterviewSchema,
} from '../models/validation';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { aiLimiter } from '../middlewares/rateLimit.middleware';
import {
  generateQuestions,
  evaluateAnswer,
  getChatHistory,
  getInterviewDetail,
  companyInterview,
  jdInterview,
  getHint,
  behavioralInterview,
  evaluateBehavioral,
} from '../controllers/ai.controller';

const router = Router();

// All AI routes require authentication
router.use(authMiddleware);

// Core interview flow
router.post('/generate-questions', aiLimiter, validateBody(generateQuestionSchema), generateQuestions);
router.post('/evaluate-answer', aiLimiter, validateBody(evaluateAnswerSchema), evaluateAnswer);

// Chat history with pagination support
router.get('/chat-history', cacheMiddleware(300), getChatHistory);
router.get('/interview/:id', getInterviewDetail);

// Company & JD interview modes
router.post('/company-interview', aiLimiter, validateBody(companyInterviewSchema), companyInterview);
router.post('/jd-interview', aiLimiter, validateBody(jdInterviewSchema), jdInterview);

// Real-time interview coaching hint
router.post('/hint', aiLimiter, validateBody(hintSchema), getHint);

// Behavioral STAR-L interview mode
router.post('/behavioral', aiLimiter, validateBody(behavioralInterviewSchema), behavioralInterview);
router.post('/behavioral/evaluate', aiLimiter, validateBody(behavioralEvaluateSchema), evaluateBehavioral);

export default router;
