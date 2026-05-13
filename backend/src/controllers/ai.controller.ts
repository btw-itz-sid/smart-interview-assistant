// ============================================
// AI Controller — Mock Interview request handlers
// Interview start, answer submit, hints, behavioral mode, history
// ============================================

import { Response } from 'express';
import * as interviewService from '../services/interview.service';
import * as aiService from '../services/ai.service';
import {
  generateQuestionSchema,
  evaluateAnswerSchema,
} from '../models/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

// ============================================
// POST /api/ai/generate-questions — Start a mock interview
// ============================================
export const generateQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Interview question generation request received');
    const validatedData = generateQuestionSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = await interviewService.startInterview(
      userId,
      validatedData.topic,
      validatedData.difficulty,
      validatedData.count
    );

    sendResponse(res, 201, 'Interview questions generated successfully!', result);
  }
);

// ============================================
// POST /api/ai/evaluate-answer — Submit and evaluate an answer
// ============================================
export const evaluateAnswer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Answer evaluation request received');
    const validatedData = evaluateAnswerSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = await interviewService.submitAnswer(
      userId,
      validatedData.questionId,
      validatedData.interviewId,
      validatedData.question,
      validatedData.answer,
      validatedData.topic
    );

    sendResponse(res, 200, 'Answer evaluated successfully!', result);
  }
);

// ============================================
// GET /api/ai/chat-history — All past interview sessions
// ============================================
export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Chat history request received');
    const userId = req.user!.userId;
    const { topic, page = '1', limit = '20' } = req.query as any;

    const history = await interviewService.getChatHistory(userId, {
      topic,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    sendResponse(res, 200, 'Chat history retrieved', history);
  }
);

// ============================================
// GET /api/ai/interview/:id — Specific interview detail
// ============================================
export const getInterviewDetail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Interview detail request received');
    const userId = req.user!.userId;
    const interviewId = parseInt(req.params.id, 10);

    if (isNaN(interviewId)) {
      throw new Error('Interview ID must be a valid number');
    }

    const detail = await interviewService.getInterviewDetail(userId, interviewId);
    sendResponse(res, 200, 'Interview detail retrieved', detail);
  }
);

// ============================================
// POST /api/ai/company-interview — Company-specific interview
// ============================================
export const companyInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { company, role, difficulty = 'medium', count = 5 } = req.body;

    if (!company || !role) {
      return sendResponse(res, 400, 'Company and role are both required', null);
    }

    logger.info(`Company interview request — ${company} / ${role}`);
    const result = await aiService.generateCompanyInterview(company, role, difficulty, count);
    sendResponse(res, 200, 'Company interview is ready!', result);
  }
);

// ============================================
// POST /api/ai/jd-interview — JD-to-Interview pipeline
// ============================================
export const jdInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { jobDescription, count = 5 } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return sendResponse(res, 400, 'Please provide a valid job description (min 50 characters)', null);
    }

    logger.info('JD interview request received');
    const result = await aiService.generateJDInterview(jobDescription, count);
    sendResponse(res, 200, 'JD-based interview is ready!', result);
  }
);

// ============================================
// POST /api/ai/hint — Get a real-time hint during interview
// ============================================
export const getHint = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { question, partialAnswer, topic } = req.body;

    if (!question || !topic) {
      return sendResponse(res, 400, 'Question and topic are required', null);
    }

    logger.info('Interview hint request received');
    const result = await aiService.getInterviewHint(question, partialAnswer || '', topic);
    sendResponse(res, 200, 'Hint generated', result);
  }
);

// ============================================
// POST /api/ai/behavioral — Behavioral STAR-L interview
// ============================================
export const behavioralInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { focusArea = 'general', count = 4 } = req.body;

    logger.info(`Behavioral interview request — Focus: ${focusArea}`);
    const result = await aiService.generateBehavioralInterview(focusArea, count);
    sendResponse(res, 200, 'Behavioral interview is ready!', result);
  }
);

// ============================================
// POST /api/ai/behavioral/evaluate — Evaluate behavioral answer
// ============================================
export const evaluateBehavioral = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return sendResponse(res, 400, 'Question and answer are required', null);
    }

    logger.info('Behavioral evaluation request received');
    const result = await aiService.evaluateBehavioralAnswer(question, answer);
    sendResponse(res, 200, 'Behavioral answer evaluated!', result);
  }
);
