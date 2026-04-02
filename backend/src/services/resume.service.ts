// ============================================
// Resume Service - Resume analysis ki business logic
// AI se resume analyze karwata hai aur structured feedback deta hai
// ============================================

import * as aiService from './ai.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { getScoreGrade, getScoreFeedback } from '../utils/scoreCalculator';

// Resume analysis ka full response interface
export interface ResumeAnalysisResult {
  overallScore: number;
  grade: string;
  scoreFeedback: string;
  analysis: string;
  suggestions: string[];
  strengths: string[];
  keywords: {
    present: string[];
    missing: string[];
  };
  atsFriendly: boolean; // Applicant Tracking System ke liye suitable hai ya nahi
}

// ============================================
// Resume analyze karo aur detailed feedback do
// Basic AI analysis ke upar extra processing karta hai
// ============================================
export const analyzeResume = async (
  resumeText: string,
  jobRole?: string
): Promise<ResumeAnalysisResult> => {
  logger.info(`Resume analysis shuru - Job Role: ${jobRole || 'General'}`);

  // ATS keywords jo commonly required hote hain
  const commonKeywords = [
    'experience', 'skills', 'education', 'projects',
    'achievements', 'leadership', 'communication', 'teamwork',
  ];

  // Step 1: Check karo ki resume mein basic sections hain ki nahi
  const resumeLower = resumeText.toLowerCase();
  const presentKeywords = commonKeywords.filter((kw) =>
    resumeLower.includes(kw)
  );
  const missingKeywords = commonKeywords.filter(
    (kw) => !resumeLower.includes(kw)
  );

  // ATS friendly tab hai jab 60% se zyada keywords present hain
  const atsFriendly = presentKeywords.length / commonKeywords.length >= 0.6;

  // Step 2: AI se detailed analysis lo
  let aiResult;
  try {
    aiResult = await aiService.analyzeResume(resumeText, jobRole);
  } catch (error: any) {
    logger.error('AI resume analysis fail hua', { error: error.message });
    throw new ApiError(500, `Resume analysis mein problem: ${error.message}`);
  }

  // Step 3: Resume ki length aur content ke basis pe basic score
  // Yeh simple heuristic hai - AI score se combine hoga
  let baseScore = 5; // Starting point

  // Word count bonus (200-800 words = ideal)
  const wordCount = resumeText.trim().split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 800) baseScore += 1;
  else if (wordCount < 100) baseScore -= 2; // Bahut chota hai

  // Keywords bonus
  const keywordRatio = presentKeywords.length / commonKeywords.length;
  baseScore += Math.round(keywordRatio * 2);

  // ATS friendly bonus
  if (atsFriendly) baseScore += 1;

  // 0-10 clamp karo
  const overallScore = Math.max(0, Math.min(10, baseScore));
  const grade = getScoreGrade(overallScore);
  const scoreFeedback = getScoreFeedback(overallScore);

  // Step 4: Strengths extract karo suggestions se
  // First 2 suggestions ko "strength" consider karo
  const strengths = aiResult.suggestions.slice(0, 2).map((s) =>
    s.replace(/^(add|include|improve|fix|update)\s+/i, 'Has ')
  );

  logger.info(`Resume analysis complete - Score: ${overallScore}/10, ATS: ${atsFriendly}`);

  return {
    overallScore,
    grade,
    scoreFeedback,
    analysis: aiResult.analysis,
    suggestions: aiResult.suggestions,
    strengths,
    keywords: {
      present: presentKeywords,
      missing: missingKeywords,
    },
    atsFriendly,
  };
};

// ============================================
// Interview topics suggest karo resume ke basis pe
// Resume read karke kaunse topics pe interview prepare karna chahiye
// ============================================
export const suggestInterviewTopics = async (
  resumeText: string,
  jobRole?: string
): Promise<string[]> => {
  logger.info('Resume se interview topics suggest kiye ja rahe hain');

  // Common tech stacks dhundho resume mein
  const techKeywords: Record<string, string[]> = {
    'JavaScript': ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'spring', 'hibernate'],
    'System Design': ['microservices', 'docker', 'kubernetes', 'aws', 'cloud'],
    'Database': ['sql', 'postgres', 'mysql', 'mongodb', 'redis'],
    'Data Structures': ['algorithms', 'leetcode', 'problem solving'],
  };

  const resumeLower = resumeText.toLowerCase();
  const suggestedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(techKeywords)) {
    if (keywords.some((kw) => resumeLower.includes(kw))) {
      suggestedTopics.push(topic);
    }
  }

  // Agar koi match nahi mila toh default topics suggest karo
  if (suggestedTopics.length === 0) {
    suggestedTopics.push(
      'Problem Solving',
      'Communication Skills',
      'Behavioral Questions'
    );
  }

  // Job role ke basis pe extra topics add karo
  if (jobRole) {
    const roleLower = jobRole.toLowerCase();
    if (roleLower.includes('frontend')) suggestedTopics.push('HTML/CSS', 'React');
    if (roleLower.includes('backend')) suggestedTopics.push('APIs', 'Database Design');
    if (roleLower.includes('fullstack')) suggestedTopics.push('System Design');
    if (roleLower.includes('data')) suggestedTopics.push('Machine Learning', 'Statistics');
  }

  return [...new Set(suggestedTopics)]; // Duplicates remove karo
};

// ============================================
// Generate a new Resume based on User's mock interview performance
// ============================================
export const generateNewResume = async (userId: number): Promise<string> => {
  logger.info(`Resume generation request for User: ${userId}`);

  // Fetch topic progress using progress service / repository
  // To avoid circular dependency logic, we'll fetch direct from repository if needed
  // assuming we can import progress repository here
  const { findProgressByUserId } = require('../repositories/progress.repository');
  const progressList = await findProgressByUserId(userId);
  
  const topicProgressDetails = progressList.map((p: any) => ({
    topic: p.topic,
    averageScore: p.avgScore
  }));

  // if user has no data, still give a baseline resume
  if (topicProgressDetails.length === 0) {
    topicProgressDetails.push({ topic: 'JavaScript', averageScore: 8 });
    topicProgressDetails.push({ topic: 'React', averageScore: 7 });
  }

  const generatedResume = await aiService.generateResume(topicProgressDetails);
  return generatedResume;
};
