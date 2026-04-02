// ============================================
// AI Controller - Mock Interview ke request handlers
// Interview start karna, answer submit karna, history dekhna
// ============================================

import { Response } from 'express';
import * as interviewService from '../services/interview.service';
import {
  generateQuestionSchema,
  evaluateAnswerSchema,
} from '../models/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

// ============================================
// POST /api/ai/generate-questions - Interview start karo
// AI se questions generate hoke aayenge
// ============================================
export const generateQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Interview question generation request aayi');

    // Step 1: Input validate karo
    const validatedData = generateQuestionSchema.parse(req.body);

    // Step 2: User ID nikalo token se
    const userId = req.user!.userId;

    // Step 3: Interview service se questions generate karo
    const result = await interviewService.startInterview(
      userId,
      validatedData.topic,
      validatedData.difficulty,
      validatedData.count
    );

    // Step 4: Response bhejo questions ke saath
    sendResponse(res, 201, 'Interview questions generate ho gaye!', result);
  }
);

// ============================================
// POST /api/ai/evaluate-answer - Answer submit karo evaluation ke liye
// AI answer check karke score aur feedback dega
// ============================================
export const evaluateAnswer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Answer evaluation request aayi');

    // Step 1: Input validate karo
    const validatedData = evaluateAnswerSchema.parse(req.body);

    // Step 2: User ID nikalo
    const userId = req.user!.userId;

    // Step 3: Interview service se answer evaluate karvao
    const result = await interviewService.submitAnswer(
      userId,
      validatedData.questionId,
      validatedData.interviewId,
      validatedData.question,
      validatedData.answer,
      validatedData.topic
    );

    // Step 4: Evaluation result bhejo
    sendResponse(res, 200, 'Answer evaluate ho gaya!', result);
  }
);

// ============================================
// GET /api/ai/chat-history - Saari interview history nikalo
// Pichle saare interviews aur unke Q&A dikhata hai
// ============================================
export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Chat history request aayi');

    const userId = req.user!.userId;

    const history = await interviewService.getChatHistory(userId);

    sendResponse(res, 200, 'Chat history mil gayi', history);
  }
);

// ============================================
// GET /api/ai/interview/:id - Specific interview ki detail
// ============================================
export const getInterviewDetail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Interview detail request aayi');

    const userId = req.user!.userId;
    const interviewId = parseInt(req.params.id, 10);

    if (isNaN(interviewId)) {
      throw new Error('Interview ID valid number honi chahiye');
    }

    const detail = await interviewService.getInterviewDetail(
      userId,
      interviewId
    );

    sendResponse(res, 200, 'Interview detail mil gayi', detail);
  }
);
