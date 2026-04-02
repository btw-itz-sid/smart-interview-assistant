// ============================================
// Progress Repository - User progress aur analytics ke DB operations
// Yeh file user ke performance data ko manage karti hai
// ============================================

import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Kisi topic ka progress update karo ya naya banao
// Upsert use kiya hai - agar record hai toh update, nahi toh create
export const upsertProgress = async (data: {
  userId: number;
  topic: string;
  score: number;
}) => {
  // Pehle check karo ki is user ka is topic ka progress already hai ya nahi
  const existing = await prisma.progress.findFirst({
    where: {
      userId: data.userId,
      topic: data.topic,
    },
  });

  if (existing) {
    // Existing record hai - running average calculate karo aur update karo
    const newTotalIter = existing.totalIter + 1;
    const newAvgScore =
      (existing.avgScore * existing.totalIter + data.score) / newTotalIter;

    const updated = await prisma.progress.update({
      where: { id: existing.id },
      data: {
        avgScore: Math.round(newAvgScore * 100) / 100, // 2 decimal places
        totalIter: newTotalIter,
      },
    });
    logger.debug(`Progress updated - Topic: ${data.topic}, New Avg: ${newAvgScore}`);
    return updated;
  } else {
    // Naya record create karo - pehli baar is topic par interview di hai
    const created = await prisma.progress.create({
      data: {
        userId: data.userId,
        topic: data.topic,
        avgScore: data.score,
        totalIter: 1,
      },
    });
    logger.debug(`Naya progress record - Topic: ${data.topic}, Score: ${data.score}`);
    return created;
  }
};

// User ka poora progress data nikalo - saare topics ka
export const findProgressByUserId = async (userId: number) => {
  const progress = await prisma.progress.findMany({
    where: { userId },
    orderBy: {
      avgScore: 'desc', // Highest score wale topics pehle
    },
  });
  return progress;
};

// User ka overall analytics nikalo - aggregate data
export const getAnalytics = async (userId: number) => {
  // Total interviews count karo
  const totalInterviews = await prisma.interview.count({
    where: { userId },
  });

  // Average score nikalo saari interviews ka
  const avgScoreResult = await prisma.interview.aggregate({
    where: {
      userId,
      score: { not: null }, // Sirf wahi interviews jinka score hai
    },
    _avg: {
      score: true,
    },
  });

  // Topic wise progress nikalo
  const topicProgress = await prisma.progress.findMany({
    where: { userId },
    orderBy: { avgScore: 'desc' },
  });

  // Recent 10 interviews nikalo
  const recentInterviews = await prisma.interview.findMany({
    where: { userId },
    select: {
      id: true,
      topic: true,
      score: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    totalInterviews,
    averageScore: Math.round((avgScoreResult._avg.score || 0) * 100) / 100,
    topicWiseProgress: topicProgress.map((p) => ({
      topic: p.topic,
      avgScore: p.avgScore,
      totalAttempts: p.totalIter,
    })),
    recentInterviews,
  };
};
