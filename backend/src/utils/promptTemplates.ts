export const INTERVIEW_PROMPTS = {
  DSA: `Generate a challenging Data Structures and Algorithms interview question that tests problem-solving skills. 
Ask about a specific algorithm, data structure optimization, or coding challenge. 
Keep the question concise and provide context if needed. 
Do not include the answer, only the question.`,

  HR: `Generate a behavioral interview question that assesses soft skills, teamwork, communication, or conflict resolution. 
Ask about a specific scenario or experience the candidate might have. 
Keep the question clear and focused. 
Do not include suggested answers, only the question.`,

  'System Design': `Generate a system design interview question that tests architecture and scalability knowledge. 
Ask the candidate to design a system (e.g., URL shortener, messaging app, recommendation system, etc.). 
Include requirements like scale, latency, and consistency considerations. 
Keep the question focused but challenging. 
Do not include solutions, only the question.`,
} as const;
