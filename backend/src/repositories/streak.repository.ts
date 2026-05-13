// ============================================
// Streak & Badge Repository — Gamification DB operations
// Handles daily streaks, XP, levels, and badge awards
// ============================================

import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Badge thresholds — earned automatically when conditions are met
const BADGE_DEFINITIONS: Record<string, { label: string; condition: string }> = {
  FIRST_INTERVIEW: { label: 'First Steps', condition: 'Complete your first interview' },
  WEEK_WARRIOR: { label: '7-Day Warrior', condition: '7-day practice streak' },
  MONTH_MASTER: { label: '30-Day Master', condition: '30-day practice streak' },
  PERFECT_10: { label: 'Perfect Score', condition: 'Score 10/10 on any question' },
  FIVE_TOPICS: { label: 'Versatile', condition: 'Practice 5 different topics' },
  TEN_INTERVIEWS: { label: 'Dedicated', condition: 'Complete 10 interviews' },
  FIFTY_INTERVIEWS: { label: 'Interview Machine', condition: 'Complete 50 interviews' },
  RESUME_PRO: { label: 'Resume Pro', condition: 'Achieve ATS score 80+' },
  SPEED_DEMON: { label: 'Speed Demon', condition: 'Answer a question in under 60 seconds' },
  BEHAVIORAL_ACE: { label: 'Behavioral Ace', condition: 'Score 8+ on behavioral interview' },
};

// XP rewards per action
const XP_REWARDS = {
  COMPLETE_INTERVIEW: 50,
  SCORE_ABOVE_7: 30,
  SCORE_PERFECT_10: 100,
  DAILY_STREAK_BONUS: 20,
  FIRST_OF_DAY: 10,
  BADGE_EARNED: 75,
};

// Level thresholds
const getLevelFromXP = (xp: number): number => {
  if (xp >= 5000) return 10;
  if (xp >= 3500) return 9;
  if (xp >= 2500) return 8;
  if (xp >= 1800) return 7;
  if (xp >= 1200) return 6;
  if (xp >= 800) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};

// Get or create streak record for a user
export const getOrCreateStreak = async (userId: number) => {
  let streak = await prisma.streak.findUnique({ where: { userId } });
  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, currentStreak: 0, longestStreak: 0, totalXP: 0, level: 1 },
    });
  }
  return streak;
};

// Update streak after an interview — called on every interview completion
export const updateStreakOnActivity = async (userId: number, interviewScore?: number) => {
  const streak = await getOrCreateStreak(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  let newStreak = streak.currentStreak;
  let xpGained = XP_REWARDS.COMPLETE_INTERVIEW;

  if (!lastActive || lastActive.getTime() < today.getTime()) {
    // New day activity
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      // Consecutive day — streak continues
      newStreak = streak.currentStreak + 1;
      xpGained += XP_REWARDS.DAILY_STREAK_BONUS;
    } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
      // Streak broken — reset to 1
      newStreak = 1;
    }
    xpGained += XP_REWARDS.FIRST_OF_DAY;
  }
  // Same day — streak stays the same

  // Score bonuses
  if (interviewScore && interviewScore >= 7) xpGained += XP_REWARDS.SCORE_ABOVE_7;
  if (interviewScore && interviewScore === 10) xpGained += XP_REWARDS.SCORE_PERFECT_10;

  const newTotalXP = streak.totalXP + xpGained;
  const newLevel = getLevelFromXP(newTotalXP);
  const newLongest = Math.max(streak.longestStreak, newStreak);

  const updated = await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: new Date(),
      totalXP: newTotalXP,
      level: newLevel,
    },
  });

  logger.info(`Streak updated — User: ${userId}, Streak: ${newStreak}, XP: +${xpGained}, Level: ${newLevel}`);

  // Check for badge eligibility
  await checkAndAwardBadges(userId, newStreak, interviewScore);

  return { ...updated, xpGained };
};

// Check and award badges based on current stats
const checkAndAwardBadges = async (userId: number, currentStreak: number, score?: number) => {
  const newBadges: string[] = [];

  // Count-based badges
  const interviewCount = await prisma.interview.count({ where: { userId } });
  const topicCount = await prisma.progress.count({ where: { userId } });

  const badgeChecks: [string, boolean][] = [
    ['FIRST_INTERVIEW', interviewCount >= 1],
    ['TEN_INTERVIEWS', interviewCount >= 10],
    ['FIFTY_INTERVIEWS', interviewCount >= 50],
    ['WEEK_WARRIOR', currentStreak >= 7],
    ['MONTH_MASTER', currentStreak >= 30],
    ['PERFECT_10', score === 10],
    ['FIVE_TOPICS', topicCount >= 5],
  ];

  for (const [badgeType, eligible] of badgeChecks) {
    if (eligible) {
      try {
        await prisma.badge.create({ data: { userId, badgeType } });
        newBadges.push(badgeType);
        logger.info(`Badge awarded — User: ${userId}, Badge: ${badgeType}`);
      } catch {
        // Already has this badge (unique constraint)
      }
    }
  }

  return newBadges;
};

// Get user's badges
export const getUserBadges = async (userId: number) => {
  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
  });
  return badges.map((b: any) => ({
    ...b,
    label: BADGE_DEFINITIONS[b.badgeType]?.label || b.badgeType,
    description: BADGE_DEFINITIONS[b.badgeType]?.condition || '',
  }));
};

// Get all badge definitions (for showing locked/unlocked state)
export const getAllBadgeDefinitions = () => BADGE_DEFINITIONS;

// Get XP needed for next level
export const getXPForNextLevel = (currentXP: number): { current: number; next: number; progress: number } => {
  const thresholds = [0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000];
  const level = getLevelFromXP(currentXP);
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
  const progress = Math.round(((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  return { current: currentXP, next: nextThreshold, progress: Math.min(100, progress) };
};
