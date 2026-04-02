// ============================================
// Interview Model - TypeScript Interfaces
// AI Mock Interview sessions ki TypeScript definitions
// ============================================

// Difficulty levels ke liye enum-like type
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Single question ka representation
export interface Question {
  id: number;
  interviewId: number;
  question: string;
  answer: string | null;      // User ka answer (null agar abhi diya nahi)
  evaluation: string | null;  // AI ka feedback (null agar evaluate nahi hua)
  score: number | null;       // 0-10 score (null agar evaluate nahi hua)
  createdAt: Date;
  updatedAt: Date;
}

// Sirf question text (initial response mein, answer nahi hoga)
export interface QuestionBasic {
  id: number;
  question: string;
}

// Full interview session with all questions
export interface Interview {
  id: number;
  userId: number;
  topic: string;
  score: number | null;       // Overall avg score
  feedback: string | null;    // Overall feedback
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
}

// Interview start karne ke liye DTO
export interface CreateInterviewDto {
  userId: number;
  topic: string;
}

// Question create karne ke liye DTO
export interface CreateQuestionDto {
  interviewId: number;
  question: string;
}

// Answer submit karne ke baad milne wala response
export interface EvaluationResult {
  questionId: number;
  score: number;
  evaluation: string;
}

// Interview start karne ke baad milne wala response
export interface InterviewStartResponse {
  interviewId: number;
  topic: string;
  difficulty: DifficultyLevel;
  questions: QuestionBasic[];
}

// Chat history mein ek interview ka summary
export interface InterviewSummary {
  interviewId: number;
  topic: string;
  score: number | null;
  feedback: string | null;
  date: Date;
  questionsCount: number;
  answeredCount: number;
}
