// ============================================
// Interview Repository - Interview aur Question model ke DB operations
// Mock interview ki history yahan se manage hoti hai
// ============================================

import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Nayi interview session create karo jab user interview shuru kare
export const createInterview = async (data: {
  userId: number;
  topic: string;
}) => {
  const interview = await prisma.interview.create({
    data: {
      userId: data.userId,
      topic: data.topic,
    },
  });
  logger.debug(`Nayi interview create hui - Topic: ${data.topic}`);
  return interview;
};

// Interview ID se interview dhundho saare questions ke saath
export const findInterviewById = async (id: number) => {
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      questions: true, // Saare questions bhi laao
    },
  });
  return interview;
};

// User ki interviews — supports pagination and filtering
export const findInterviewsByUserId = async (userId: number, options?: { skip?: number; take?: number; where?: any }) => {
  const where = options?.where || { userId };
  const interviews = await prisma.interview.findMany({
    where,
    include: {
      questions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: options?.skip,
    take: options?.take,
  });
  return interviews;
};

// Count interviews for pagination
export const countInterviews = async (where: any) => {
  return prisma.interview.count({ where });
};

// Interview ka score aur feedback update karo jab evaluation complete ho
export const updateInterviewScore = async (
  interviewId: number,
  score: number,
  feedback: string
) => {
  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: { score, feedback },
  });
  logger.debug(`Interview ${interviewId} score updated: ${score}`);
  return updated;
};

// Naya question add karo interview mein
export const addQuestion = async (data: {
  interviewId: number;
  question: string;
}) => {
  const question = await prisma.question.create({
    data: {
      interviewId: data.interviewId,
      question: data.question,
    },
  });
  return question;
};

// Question ka answer aur evaluation save karo
export const updateQuestionAnswer = async (
  questionId: number,
  answer: string,
  evaluation: string,
  score: number
) => {
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { answer, evaluation, score },
  });
  logger.debug(`Question ${questionId} answer saved — Score: ${score}`);
  return updated;
};

// Specific user ki specific topic ki interviews dhundho
export const findInterviewsByTopic = async (userId: number, topic: string) => {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      topic: {
        contains: topic,
        mode: 'insensitive',
      },
    },
    include: {
      questions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return interviews;
};
