// ============================================
// Score Calculator - Interview scoring utilities
// Scores calculate karne ke saare helper functions yahan hain
// ============================================

// ============================================
// Weighted average calculate karo
// Recent interviews ko zyada weightage deta hai
// ============================================
export const calculateWeightedAverage = (scores: number[]): number => {
  if (scores.length === 0) return 0;

  // Recent scores ko zyada importance - exponential weighting
  const weights = scores.map((_, i) => Math.pow(1.2, i)); // Latest = highest weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);

  return parseFloat((weightedSum / totalWeight).toFixed(2));
};

// ============================================
// Score ko percentage mein convert karo (0-10 → 0-100)
// ============================================
export const scoreToPercentage = (score: number): number => {
  return Math.round((score / 10) * 100);
};

// ============================================
// Score ke basis pe grade deta hai
// A+ = 9-10, A = 8-9, B = 7-8, C = 5-7, D = 3-5, F = 0-3
// ============================================
export const getScoreGrade = (score: number): string => {
  if (score >= 9) return 'A+';
  if (score >= 8) return 'A';
  if (score >= 7) return 'B+';
  if (score >= 6) return 'B';
  if (score >= 5) return 'C';
  if (score >= 3) return 'D';
  return 'F';
};

// ============================================
// Score ke basis pe feedback message
// ============================================
export const getScoreFeedback = (score: number): string => {
  if (score >= 9) return 'Outstanding! 🌟 Bahut badhiya performance hai';
  if (score >= 8) return 'Excellent! 🎉 Aap interview ke liye ready hain';
  if (score >= 7) return 'Good job! 👍 Thodi aur practice karo';
  if (score >= 5) return 'Average 📚 Concepts ko aur better karo';
  if (score >= 3) return 'Needs work 💪 Zyada practice karo - ho jaayega!';
  return 'Keep trying! 🔁 Fundamentals se shuru karo';
};

// ============================================
// Topics classify karo - strong/average/weak
// ============================================
export const classifyTopics = (
  topics: { topic: string; avgScore: number }[]
): { strong: string[]; average: string[]; weak: string[] } => {
  const strong: string[] = [];
  const average: string[] = [];
  const weak: string[] = [];

  for (const t of topics) {
    if (t.avgScore >= 7) strong.push(t.topic);
    else if (t.avgScore >= 5) average.push(t.topic);
    else weak.push(t.topic);
  }

  return { strong, average, weak };
};

// ============================================
// Overall interview score calculate karo
// Saare questions ke scores ka average
// ============================================
export const calculateInterviewScore = (questionScores: (number | null)[]): number => {
  const validScores = questionScores.filter((s): s is number => s !== null);
  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
};

// ============================================
// Progress improvement calculate karo
// Pehle aur abhi ke scores ka diff
// ============================================
export const calculateImprovement = (
  previousScore: number,
  currentScore: number
): { diff: number; percentage: string; improved: boolean } => {
  const diff = parseFloat((currentScore - previousScore).toFixed(2));
  const percentage =
    previousScore === 0
      ? '100%'
      : `${Math.abs(Math.round((diff / previousScore) * 100))}%`;
  return {
    diff,
    percentage,
    improved: diff > 0,
  };
};
