// ============================================
// Progress Controller — Analytics, streaks, badges, readiness score
// ============================================

import { Response } from 'express';
import * as progressService from '../services/progress.service';
import * as streakRepo from '../repositories/streak.repository';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

// GET /api/progress/analytics — Complete dashboard analytics
export const getAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Analytics request received');
    const userId = req.user!.userId;
    const analytics = await progressService.getUserAnalytics(userId);
    sendResponse(res, 200, 'Analytics retrieved', analytics);
  }
);

// GET /api/progress/topics — Topic-wise progress
export const getTopicProgress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Topic progress request received');
    const userId = req.user!.userId;
    const progress = await progressService.getTopicProgress(userId);
    sendResponse(res, 200, 'Topic progress retrieved', progress);
  }
);

// GET /api/progress/streak — Current streak, XP, level
export const getStreak = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const streak = await streakRepo.getOrCreateStreak(userId);
    const xpInfo = streakRepo.getXPForNextLevel(streak.totalXP);

    sendResponse(res, 200, 'Streak data retrieved', {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalXP: streak.totalXP,
      level: streak.level,
      lastActiveDate: streak.lastActiveDate,
      xpProgress: xpInfo,
    });
  }
);

// GET /api/progress/badges — User's earned badges
export const getBadges = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const earned = await streakRepo.getUserBadges(userId);
    const allBadges = streakRepo.getAllBadgeDefinitions();

    // Map all badges with earned/locked state
    const badges = Object.entries(allBadges).map(([type, def]) => {
      const earnedBadge = earned.find(b => b.badgeType === type);
      return {
        type,
        label: def.label,
        description: def.condition,
        earned: !!earnedBadge,
        earnedAt: earnedBadge?.earnedAt || null,
      };
    });

    sendResponse(res, 200, 'Badges retrieved', { badges, totalEarned: earned.length, totalAvailable: Object.keys(allBadges).length });
  }
);

// GET /api/progress/readiness — Interview Readiness Score (composite)
export const getReadinessScore = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const analytics = await progressService.getUserAnalytics(userId);
    const streak = await streakRepo.getOrCreateStreak(userId);

    const topics = analytics.topicWiseProgress || [];
    const totalInterviews = analytics.totalInterviews || 0;
    const avgScore = analytics.averageScore || 0;

    // Readiness Score Calculation (0-100):
    // Topic breadth (20%): How many different topics practiced
    const topicBreadth = Math.min(100, (topics.length / 8) * 100);

    // Average score (30%): Normalized to 0-100
    const scoreComponent = (avgScore / 10) * 100;

    // Consistency (20%): Based on streak
    const consistencyComponent = Math.min(100, (streak.currentStreak / 14) * 100);

    // Volume (15%): Based on total interviews
    const volumeComponent = Math.min(100, (totalInterviews / 20) * 100);

    // Weak topics penalty (15%): Fewer weak topics = better
    const weakTopics = topics.filter((t: any) => t.avgScore < 5);
    const weakComponent = Math.max(0, 100 - (weakTopics.length * 25));

    const readinessScore = Math.round(
      topicBreadth * 0.20 +
      scoreComponent * 0.30 +
      consistencyComponent * 0.20 +
      volumeComponent * 0.15 +
      weakComponent * 0.15
    );

    // Readiness label
    let readinessLabel = 'Just Starting';
    let readinessColor = '#ef4444';
    if (readinessScore >= 85) { readinessLabel = 'Ready to Crush It'; readinessColor = '#10b981'; }
    else if (readinessScore >= 70) { readinessLabel = 'Interview Ready'; readinessColor = '#22c55e'; }
    else if (readinessScore >= 50) { readinessLabel = 'Getting There'; readinessColor = '#f59e0b'; }
    else if (readinessScore >= 25) { readinessLabel = 'Building Foundation'; readinessColor = '#f97316'; }

    // Actionable recommendation
    const recommendations: string[] = [];
    if (topicBreadth < 60) recommendations.push(`Practice more topics — you've only covered ${topics.length} so far`);
    if (scoreComponent < 70) recommendations.push(`Focus on improving scores — your average is ${avgScore}/10`);
    if (consistencyComponent < 50) recommendations.push(`Build consistency — practice daily to maintain a streak`);
    if (weakTopics.length > 0) recommendations.push(`Strengthen weak areas: ${weakTopics.map((t: any) => t.topic).join(', ')}`);

    sendResponse(res, 200, 'Readiness score calculated', {
      readinessScore,
      readinessLabel,
      readinessColor,
      breakdown: {
        topicBreadth: Math.round(topicBreadth),
        averageScore: Math.round(scoreComponent),
        consistency: Math.round(consistencyComponent),
        volume: Math.round(volumeComponent),
        weakTopics: Math.round(weakComponent),
      },
      recommendations,
      meta: {
        totalTopics: topics.length,
        totalInterviews,
        currentStreak: streak.currentStreak,
        weakTopicCount: weakTopics.length,
      },
    });
  }
);
