// ============================================
// AI Interview Routes — /api/ai/*
// Mock interview, hints, behavioral, company, JD routes
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
router.post('/generate-questions', validateBody(generateQuestionSchema), generateQuestions);
router.post('/evaluate-answer', validateBody(evaluateAnswerSchema), evaluateAnswer);

// Chat history with pagination support
router.get('/chat-history', cacheMiddleware(300), getChatHistory);
router.get('/interview/:id', getInterviewDetail);

// Company & JD interview modes
router.post('/company-interview', companyInterview);
router.post('/jd-interview', jdInterview);

// Real-time interview coaching hint
router.post('/hint', getHint);

// Behavioral STAR-L interview mode
router.post('/behavioral', behavioralInterview);
router.post('/behavioral/evaluate', evaluateBehavioral);

export default router;
