// ============================================
// Interview Service - Mock Interview ki business logic
// Questions generate karna, answers evaluate karna, history manage karna
// ============================================

import * as interviewRepo from '../repositories/interview.repository';
import * as progressRepo from '../repositories/progress.repository';
import * as aiService from './ai.service';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// ============================================
// Naya mock interview start karo
// AI se questions generate karke database mein save karta hai
// ============================================
export const startInterview = async (
  userId: number,
  topic: string,
  difficulty: string = 'medium',
  count: number = 3
) => {
  logger.info(`Interview shuru ho rahi hai - User: ${userId}, Topic: ${topic}`);

  // Step 1: Interview session create karo database mein
  const interview = await interviewRepo.createInterview({
    userId,
    topic,
  });

  // Step 2: AI se questions generate karo
  const questions = await aiService.generateInterviewQuestions(
    topic,
    difficulty,
    count
  );

  // Step 3: Generated questions ko database mein save karo
  const savedQuestions = [];
  for (const questionText of questions) {
    const saved = await interviewRepo.addQuestion({
      interviewId: interview.id,
      question: questionText,
    });
    savedQuestions.push(saved);
  }

  logger.info(`Interview #${interview.id} start hui - ${savedQuestions.length} questions`);

  return {
    interviewId: interview.id,
    topic,
    difficulty,
    questions: savedQuestions.map((q) => ({
      id: q.id,
      question: q.question,
    })),
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
    }
  }

  logger.info(`Answer evaluated - Score: ${evaluation.score}/10`);

  return {
    questionId: updatedQuestion.id,
    score: evaluation.score,
    evaluation: evaluation.evaluation,
  };
};

// ============================================
// Chat history nikalo - user ki saari interviews aur Q&A
// ============================================
export const getChatHistory = async (userId: number) => {
  const interviews = await interviewRepo.findInterviewsByUserId(userId);

  // Interviews ko formatted response mein convert karo
  return interviews.map((interview) => ({
    interviewId: interview.id,
    topic: interview.topic,
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
  }));
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