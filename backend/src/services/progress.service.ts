// ============================================
// Progress Service - Analytics aur progress ki business logic
// User ka overall performance data yahan se milta hai
// ============================================

import * as progressRepo from '../repositories/progress.repository';
import { ProgressAnalytics } from '../types';
import { logger } from '../utils/logger';

// ============================================
// User ka complete analytics nikalo
// Total interviews, average score, topic-wise breakdown sab
// ============================================
export const getUserAnalytics = async (
  userId: number
): Promise<ProgressAnalytics> => {
  logger.info(`Analytics fetch ho raha hai - User: ${userId}`);

  const analytics = await progressRepo.getAnalytics(userId);

  logger.info(`Analytics ready - Total interviews: ${analytics.totalInterviews}`);

  return analytics;
};

// ============================================
// User ka topic-wise progress nikalo
// Har topic pe kitna score hai woh dikhata hai
// ============================================
export const getTopicProgress = async (userId: number) => {
  logger.info(`Topic progress fetch ho raha hai - User: ${userId}`);

  const progress = await progressRepo.findProgressByUserId(userId);

  return progress.map((p) => ({
    topic: p.topic,
    averageScore: p.avgScore,
    totalInterviews: p.totalIter,
    lastUpdated: p.updatedAt,
  }));
};
