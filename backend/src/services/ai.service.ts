// ============================================
// AI Service - OpenAI API ka reusable wrapper
// Yeh service saari AI-related calls handle karti hai
// Interview questions generate aur answers evaluate karta hai
// ============================================

import OpenAI from 'openai';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

// OpenAI client initialize karo API key se
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Model name constant mein rakh rahe hain taaki ek jagah se change ho sake
const AI_MODEL = 'gpt-4o-mini';

// ============================================
// Interview questions generate karne ka function
// Topic aur difficulty ke basis pe questions banata hai
// ============================================
export const generateInterviewQuestions = async (
  topic: string,
  difficulty: string = 'medium',
  count: number = 3
): Promise<string[]> => {
  try {
    logger.info(`AI se ${count} questions generate ho rahe hain - Topic: ${topic}`);

    // OpenAI API ko call karo with detailed prompt
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert technical interviewer. Generate exactly ${count} interview questions on the given topic.
          
Rules:
- Difficulty level: ${difficulty}
- Questions should be clear and specific
- Mix of theoretical and practical questions
- Return ONLY a JSON array of strings, no extra text
- Example format: ["Question 1?", "Question 2?", "Question 3?"]`,
        },
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} level interview questions on: ${topic}`,
        },
      ],
      temperature: 0.7, // Thoda creative but consistent
      max_tokens: 1000,
    });

    // Response se content nikalo
    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new ApiError(500, 'AI se koi response nahi aaya');
    }

    // JSON parse karo - AI ne array format mein diya hoga
    try {
      const questions = JSON.parse(content) as string[];
      logger.info(`${questions.length} questions successfully generate ho gaye`);
      return questions;
    } catch {
      // Agar JSON parse fail ho toh content ko manually split karo
      logger.warn('AI response JSON nahi tha, manually parse kar rahe hain');
      const lines = content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim());
      return lines.slice(0, count);
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      logger.warn('OpenAI quota exceeded. Using mock interview questions.');
      return [
        `What are the most challenging aspects of ${topic} you have encountered?`,
        `Can you explain a complex concept in ${topic} to someone without a technical background?`,
        `How do you stay updated with the latest trends and best practices in ${topic}?`
      ].slice(0, count);
    }
    // OpenAI API error handle karo
    if (error instanceof ApiError) throw error;
    logger.error('AI question generation fail hua', { error: error.message });
    throw new ApiError(500, `AI service mein problem aayi: ${error.message}`);
  }
};

// ============================================
// User ka answer evaluate karne ka function
// Score aur detailed feedback deta hai
// ============================================
export const evaluateAnswer = async (
  question: string,
  answer: string,
  topic: string
): Promise<{ score: number; evaluation: string }> => {
  try {
    logger.info(`Answer evaluate ho raha hai - Topic: ${topic}`);

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert technical interviewer evaluating a candidate's answer.

Evaluate the answer and return a JSON object with:
1. "score": A number from 0 to 10 (10 being perfect)
2. "evaluation": A detailed feedback string (2-3 paragraphs) covering:
   - What was good about the answer
   - What was missing or incorrect
   - Suggestions for improvement

Return ONLY valid JSON, no extra text.
Example: {"score": 7, "evaluation": "Good explanation of..."}`,
        },
        {
          role: 'user',
          content: `Topic: ${topic}
Question: ${question}
Candidate's Answer: ${answer}

Please evaluate this answer.`,
        },
      ],
      temperature: 0.3, // Evaluation mein consistency chahiye
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new ApiError(500, 'AI se evaluation response nahi aaya');
    }

    // JSON parse karo
    try {
      const result = JSON.parse(content) as { score: number; evaluation: string };

      // Score ko 0-10 range mein clamp karo
      result.score = Math.max(0, Math.min(10, Math.round(result.score)));

      logger.info(`Answer evaluated - Score: ${result.score}/10`);
      return result;
    } catch {
      // Agar JSON parse fail ho toh default response bhejo
      logger.warn('AI evaluation response JSON nahi tha');
      return {
        score: 5,
        evaluation: content, // Raw content hi evaluation mein daal do
      };
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      logger.warn('OpenAI quota exceeded. Using mock evaluation.');
      return {
        score: 7,
        evaluation: `Your answer for ${topic} is decent. Good points were mentioned, but it could be more detailed. Ensure you cover all edge cases.`
      };
    }
    if (error instanceof ApiError) throw error;
    logger.error('AI answer evaluation fail hua', { error: error.message });
    throw new ApiError(500, `AI evaluation mein problem aayi: ${error.message}`);
  }
};

// ============================================
// Resume analyze karne ka function (Basic placeholder)
// Abhi basic analysis deta hai, future mein detailed banayenge
// ============================================
export const analyzeResume = async (
  resumeText: string,
  jobRole?: string
): Promise<{ analysis: string; suggestions: string[] }> => {
  try {
    logger.info('Resume analyze ho raha hai');

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert resume reviewer. Analyze the given resume and provide feedback.

Return a JSON object with:
1. "analysis": A brief overall analysis (2-3 sentences)
2. "suggestions": An array of 3-5 specific improvement suggestions

Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `${jobRole ? `Target Job Role: ${jobRole}\n` : ''}Resume Content:\n${resumeText}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new ApiError(500, 'AI se resume analysis nahi aaya');
    }

    try {
      const result = JSON.parse(content) as {
        analysis: string;
        suggestions: string[];
      };
      logger.info('Resume successfully analyze ho gaya');
      return result;
    } catch {
      return {
        analysis: content,
        suggestions: ['Resume mein aur detail daalo'],
      };
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      logger.warn('OpenAI quota exceeded. Using mock resume analysis.');
      return {
        analysis: "Your resume shows a solid foundation. However, there are areas where you can present your impact more clearly.",
        suggestions: [
          "Quantify your achievements with metrics.",
          "Use strong action verbs to start bullet points.",
          "Tailor your skill section more closely to the target job role."
        ]
      };
    }
    if (error instanceof ApiError) throw error;
    logger.error('Resume analysis fail hua', { error: error.message });
    throw new ApiError(500, `Resume analysis mein problem aayi: ${error.message}`);
  }
};

// ============================================
// Resume generate karne ka function (Mock test performance based)
// AI automatically ek formatted ATS friendly resume banata hai 
// ============================================
export const generateResume = async (
  topicProgressDetails: any[]
): Promise<string> => {
  try {
    logger.info('Resume generation via AI shuru hua');

    const performanceSummary = topicProgressDetails.map(p => `${p.topic}: ${p.averageScore}/10`).join(', ');

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer. Generate a complete, highly professional Markdown formatted resume for a software engineer.
          Base the technical skills and highlights on the user's mock test performance: ${performanceSummary}.
          
          Include:
          - A strong professional summary
          - Technical Skills (categorized, highlighting their highly scored topics)
          - Professional Experience (create realistic placeholder experiences incorporating the skills they excelled at)
          - Projects (2 realistic matching projects)
          - Education
          
          Make it ATS friendly. Output only pure Markdown text. Do NOT wrap in \`\`\`markdown.`,
        }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new ApiError(500, 'AI se generated resume nahi aaya');
    }

    logger.info('Resume successfully generated by AI');
    return content;
  } catch (error: any) {
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      logger.warn('OpenAI quota exceeded. Using mock generated resume.');
      return `# Jane Doe
Software Engineer
Email: jane.doe@example.com | Phone: (555) 123-4567

## Professional Summary
Detail-oriented and adaptable Software Engineer with demonstrated proficiency in modern tech stacks.

## Technical Skills
- **Languages/Frameworks:** ${topicProgressDetails.map((p: any) => p.topic).join(', ')}
- **Databases:** PostgreSQL, MongoDB
- **Tools:** Git, Docker

## Experience
**Software Engineer | ABC Tech**
*Jan 2021 - Present*
- Developed and maintained scalable web applications utilizing ${topicProgressDetails[0]?.topic || 'React'}.
- Improved system performance by 30% through optimized queries.

## Projects
**E-commerce Dashboard**
- Built a high-performance admin dashboard with real-time analytics.

## Education
**B.S. in Computer Science**
*University of Technology*`;
    }
    if (error instanceof ApiError) throw error;
    logger.error('Resume generation fail hua', { error: error.message });
    throw new ApiError(500, `Resume generation mein problem aayi: ${error.message}`);
  }
};