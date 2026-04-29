// ============================================
// Resume Controller - Updated with resume.service
// Dedicated service use karta hai ab
// ============================================

import { Response } from 'express';
import * as resumeService from '../services/resume.service';
import * as aiService from '../services/ai.service';
import { resumeAnalyzeSchema } from '../models/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';
import pdfParse from 'pdf-parse';

// ============================================
// POST /api/resume/analyze - Resume analyze karo
// AI analysis + ATS score + suggestions deta hai
// ============================================
export const analyzeResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Resume analysis request aayi');

    // Body already validated by validate middleware
    const { resumeText, jobRole } = req.body;

    // Resume service se analysis karo
    const result = await resumeService.analyzeResume(resumeText, jobRole);

    sendResponse(res, 200, 'Resume analyze ho gaya! 📄', result);
  }
);

// ============================================
// POST /api/resume/suggest-topics - Interview topics suggest karo
// Resume ke basis pe kaunse topics pe prepare karna chahiye
// ============================================
export const suggestTopics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Interview topic suggestion request aayi');

    const { resumeText, jobRole } = req.body;

    const topics = await resumeService.suggestInterviewTopics(resumeText, jobRole);

    sendResponse(res, 200, 'Interview topics suggest ho gaye! 🎯', { topics });
  }
);

// ============================================
// POST /api/resume/upload - Resume file upload
// PDF se text extract karta hai
// ============================================
export const uploadResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Resume file upload request aayi');

    const file = (req as any).file;
    if (!file) {
      return sendResponse(res, 400, 'Kripya ek PDF file upload karein.');
    }

    try {
      // PDF buffer ko text mein parse karo
      const data = await pdfParse(file.buffer);
      sendResponse(res, 200, 'Resume parh liya gaya!', { text: data.text });
    } catch (error) {
      logger.error('PDF parsing fail hua', { error });
      return sendResponse(res, 500, 'PDF file padhne mein samasya aayi.');
    }
  }
);

// ============================================
// POST /api/resume/generate - Auto generate resume
// Mock test performance based ATS friendly resume banata hai
// ============================================
export const generateResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Auto generate resume request aayi');

    if (!req.user) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    const userId = (req.user as any).userId || (req.user as any).id;
    const generatedResume = await resumeService.generateNewResume(userId);

    sendResponse(res, 200, 'Resume successfully generated! 🎉', { resume: generatedResume });
  }
);

// ============================================
// POST /api/resume/ats-score - Advanced 5-dimension ATS Score
// Keyword match + section + formatting + quantification + length
// ============================================
export const advancedATSScore = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Advanced ATS score request aayi');

    const { resumeText, jobDescription, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 30) {
      return sendResponse(res, 400, 'Resume text required hai (min 30 characters)');
    }

    const result = await aiService.computeAdvancedATSScore(resumeText, jobDescription, targetRole);
    sendResponse(res, 200, 'Advanced ATS score ready!', result);
  }
);
