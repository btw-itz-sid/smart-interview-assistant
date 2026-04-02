// ============================================
// Progress Controller - Analytics ke request handlers
// User ka performance data aur progress yahan se milta hai
// ============================================

import { Response } from 'express';
import * as progressService from '../services/progress.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

// ============================================
// GET /api/progress/analytics - Complete analytics data
// Total interviews, avg score, topic-wise breakdown sab milega
// ============================================
export const getAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Analytics request aayi');

    const userId = req.user!.userId;

    const analytics = await progressService.getUserAnalytics(userId);

    sendResponse(res, 200, 'Analytics data mil gaya', analytics);
  }
);

// ============================================
// GET /api/progress/topics - Topic-wise progress
// Har topic pe kitne interviews diye aur kitna score aaya
// ============================================
export const getTopicProgress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Topic progress request aayi');

    const userId = req.user!.userId;

    const progress = await progressService.getTopicProgress(userId);

    sendResponse(res, 200, 'Topic progress mil gaya', progress);
  }
);
