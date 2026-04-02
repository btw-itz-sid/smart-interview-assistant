// ============================================
// Progress Model - TypeScript Interfaces
// User ka performance tracking aur analytics ke liye types
// ============================================

// Database se milne wala Progress record
export interface Progress {
  id: number;
  userId: number;
  topic: string;
  avgScore: number;   // Is topic pe average score (0-10)
  totalIter: number;  // Kitne interviews diye is topic pe
  createdAt: Date;
  updatedAt: Date;
}

// Progress create/update karte waqt
export interface UpsertProgressDto {
  userId: number;
  topic: string;
  score: number;
}

// Ek topic ki progress summary
export interface TopicProgress {
  topic: string;
  avgScore: number;
  totalAttempts: number;
  lastUpdated: Date;
}

// Poori dashboard analytics
export interface UserAnalytics {
  totalInterviews: number;
  totalQuestionsAnswered: number;
  overallAvgScore: number;           // Sabhi topics ka average
  topicWiseProgress: TopicProgress[];
  recentInterviews: {
    id: number;
    topic: string;
    score: number | null;
    createdAt: Date;
  }[];
  strongTopics: string[];   // Score > 7 wale topics
  weakTopics: string[];     // Score < 5 wale topics
}
