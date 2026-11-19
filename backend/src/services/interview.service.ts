// ============================================
// Interview Service — Mock Interview business logic
// Questions generate, answers evaluate, history manage, streaks track
// ============================================

import * as interviewRepo from '../repositories/interview.repository';
import * as progressRepo from '../repositories/progress.repository';
import * as streakRepo from '../repositories/streak.repository';
import * as aiService from './ai.service';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// ============================================
// Naya mock interview start karo
// AI se questions generate karke database mein save karta hai
// ============================================
const persistQuestions = async (
  userId: number,
  topic: string,
  questions: string[],
  options: { difficulty?: string; type?: string; company?: string } = {}
) => {
  const interview = await interviewRepo.createInterview({
    userId,
    topic,
    difficulty: options.difficulty || 'medium',
    type: options.type || 'general',
    company: options.company,
  });

  const cleaned = questions
    .map((q) => (typeof q === 'string' ? q.trim() : ''))
    .filter(Boolean);

  const savedQuestions = [];
  for (const questionText of cleaned) {
    savedQuestions.push(
      await interviewRepo.addQuestion({
        interviewId: interview.id,
        question: questionText,
      })
    );
  }

  return { interview, savedQuestions };
};

const mapSavedQuestions = (savedQuestions: { id: number; question: string }[]) =>
  savedQuestions.map((q) => ({ id: q.id, question: q.question }));

export const startInterview = async (
  userId: number,
  topic: string,
  difficulty: string = 'medium',
  count: number = 3
) => {
  logger.info(`Interview starting — User: ${userId}, Topic: ${topic}`);

  const questions = await aiService.generateInterviewQuestions(topic, difficulty, count);
  const { interview, savedQuestions } = await persistQuestions(userId, topic, questions, {
    difficulty,
    type: 'general',
  });

  logger.info(`Interview #${interview.id} started — ${savedQuestions.length} questions`);

  return {
    interviewId: interview.id,
    topic,
    difficulty,
    type: 'general',
    questions: mapSavedQuestions(savedQuestions),
  };
};

export const startCompanyInterview = async (
  userId: number,
  company: string,
  role: string,
  difficulty: string = 'medium',
  count: number = 5
) => {
  const generated = await aiService.generateCompanyInterview(company, role, difficulty, count);
  const topic = `${company} — ${role}`;
  const { interview, savedQuestions } = await persistQuestions(userId, topic, generated.questions, {
    difficulty,
    type: 'company',
    company,
  });

  return {
    interviewId: interview.id,
    topic,
    difficulty,
    type: 'company',
    questions: mapSavedQuestions(savedQuestions),
    tips: generated.tips,
    companyInfo: generated.companyInfo,
  };
};

export const startJDInterview = async (
  userId: number,
  jobDescription: string,
  count: number = 5
) => {
  const generated = await aiService.generateJDInterview(jobDescription, count);
  const topic = generated.roleTitle || 'JD Interview';
  const { interview, savedQuestions } = await persistQuestions(userId, topic, generated.questions, {
    difficulty: generated.difficulty || 'medium',
    type: 'jd',
  });

  return {
    interviewId: interview.id,
    topic,
    difficulty: generated.difficulty || 'medium',
    type: 'jd',
    questions: mapSavedQuestions(savedQuestions),
    extractedSkills: generated.extractedSkills,
    roleTitle: generated.roleTitle,
  };
};

export const startBehavioralInterview = async (
  userId: number,
  focusArea: string = 'general',
  count: number = 4
) => {
  const generated = await aiService.generateBehavioralInterview(focusArea, count);
  const topic = `Behavioral — ${focusArea}`;
  const { interview, savedQuestions } = await persistQuestions(userId, topic, generated.questions, {
    difficulty: 'medium',
    type: 'behavioral',
  });

  return {
    interviewId: interview.id,
    topic,
    type: 'behavioral',
    questions: mapSavedQuestions(savedQuestions),
    framework: generated.framework,
    tips: generated.tips,
  };
};

// ============================================
// User ka answer evaluate karo
// AI se evaluation leke database mein save karta hai
// ============================================
export const submitAnswer = async (
  userId: number,
  questionId: number,
  interviewId: number,
  question: string,
  answer: string,
  topic: string
) => {
  logger.info(`Answer submit hua - Question: ${questionId}`);

  // Step 1: Verify karo ki interview user ki hai
  const interview = await interviewRepo.findInterviewById(interviewId);

  if (!interview) {
    throw new ApiError(404, 'Interview nahi mili');
  }

  if (interview.userId !== userId) {
    throw new ApiError(403, 'Yeh interview tumhari nahi hai');
  }

  // Step 2: AI se answer evaluate karvao
  const evaluation = await aiService.evaluateAnswer(question, answer, topic);

  // Step 3: Database mein answer aur evaluation save karo
  const updatedQuestion = await interviewRepo.updateQuestionAnswer(
    questionId,
    answer,
    evaluation.evaluation,
    evaluation.score
  );

  // Step 4: Interview ka overall score update karo
  // Saare answered questions ka average score nikaalo
  const updatedInterview = await interviewRepo.findInterviewById(interviewId);
  if (updatedInterview) {
    const answeredQuestions = updatedInterview.questions.filter(
      (q) => q.score !== null
    );
    if (answeredQuestions.length > 0) {
      const avgScore = Math.round(
        answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) /
          answeredQuestions.length
      );
      await interviewRepo.updateInterviewScore(
        interviewId,
        avgScore,
        `Average score: ${avgScore}/10 across ${answeredQuestions.length} questions`
      );

      // Progress bhi update karo
      await progressRepo.upsertProgress({
        userId,
        topic,
        score: avgScore,
      });

      // Streak & XP update karo
      await streakRepo.updateStreakOnActivity(userId, avgScore);
    }
  }

  logger.info(`Answer evaluated — Score: ${evaluation.score}/10`);

  return {
    questionId: updatedQuestion.id,
    score: evaluation.score,
    evaluation: evaluation.evaluation,
  };
};

export const submitBehavioralAnswer = async (
  userId: number,
  questionId: number,
  interviewId: number,
  question: string,
  answer: string
) => {
  const interview = await interviewRepo.findInterviewById(interviewId);

  if (!interview) {
    throw new ApiError(404, 'Interview nahi mili');
  }

  if (interview.userId !== userId) {
    throw new ApiError(403, 'Yeh interview tumhari nahi hai');
  }

  const evaluation = await aiService.evaluateBehavioralAnswer(question, answer);

  await interviewRepo.updateQuestionAnswer(
    questionId,
    answer,
    evaluation.evaluation,
    evaluation.score
  );

  const updatedInterview = await interviewRepo.findInterviewById(interviewId);
  if (updatedInterview) {
    const answeredQuestions = updatedInterview.questions.filter((q) => q.score !== null);
    if (answeredQuestions.length > 0) {
      const avgScore = Math.round(
        answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length
      );
      await interviewRepo.updateInterviewScore(
        interviewId,
        avgScore,
        `Behavioral average: ${avgScore}/10 across ${answeredQuestions.length} questions`
      );
      await progressRepo.upsertProgress({
        userId,
        topic: updatedInterview.topic,
        score: avgScore,
      });
      await streakRepo.updateStreakOnActivity(userId, avgScore);
    }
  }

  return evaluation;
};

export const recordHint = async (userId: number, interviewId?: number, questionId?: number) => {
  if (!interviewId) return;

  const interview = await interviewRepo.findInterviewById(interviewId);
  if (!interview || interview.userId !== userId) return;

  await interviewRepo.incrementHintsUsed(interviewId, questionId);
};

// ============================================
// Chat history — paginated, filterable
// ============================================
export const getChatHistory = async (userId: number, options?: { topic?: string; page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = Math.min(options?.limit || 20, 50);
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (options?.topic) {
    where.topic = { contains: options.topic, mode: 'insensitive' };
  }

  const [interviews, total] = await Promise.all([
    interviewRepo.findInterviewsByUserId(userId, { skip, take: limit, where }),
    interviewRepo.countInterviews(where),
  ]);

  return {
    interviews: interviews.map((interview) => ({
      interviewId: interview.id,
      topic: interview.topic,
      type: interview.type,
      company: interview.company,
      difficulty: interview.difficulty,
      score: interview.score,
      feedback: interview.feedback,
      date: interview.createdAt,
      questions: interview.questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        evaluation: q.evaluation,
        score: q.score,
      })),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// Single interview ki detail nikalo
// ============================================
export const getInterviewDetail = async (
  userId: number,
  interviewId: number
) => {
  const interview = await interviewRepo.findInterviewById(interviewId);

  if (!interview) {
    throw new ApiError(404, 'Interview nahi mili');
  }

  if (interview.userId !== userId) {
    throw new ApiError(403, 'Yeh interview tumhari nahi hai');
  }

  return {
    interviewId: interview.id,
    topic: interview.topic,
    type: interview.type,
    company: interview.company,
    difficulty: interview.difficulty,
    score: interview.score,
    feedback: interview.feedback,
    date: interview.createdAt,
    questions: interview.questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      evaluation: q.evaluation,
      score: q.score,
    })),
  };
};