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

// ============================================
// Company-Specific Interview Questions generate karo
// Target company ke known patterns ke basis pe questions
// ============================================
export const generateCompanyInterview = async (
  company: string,
  role: string,
  difficulty: string = 'medium',
  count: number = 5
): Promise<{ questions: string[]; tips: string[]; companyInfo: string }> => {
  try {
    logger.info(`Company interview generate ho raha hai - Company: ${company}, Role: ${role}`);

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach who knows the interview styles of top companies.

Generate a company-specific interview for the given company and role.

Return a JSON object with:
1. "questions": Array of exactly ${count} interview questions (mix of technical, behavioral, and culture-fit) that this specific company is known to ask
2. "tips": Array of 3-4 company-specific tips (e.g., "Amazon focuses on Leadership Principles", "Google values problem-solving approach over just the answer")
3. "companyInfo": A 1-sentence description of this company's interview style

Difficulty: ${difficulty}
Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Company: ${company}\nRole: ${role}\nGenerate ${count} interview questions for this position.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new ApiError(500, 'AI se company interview nahi aaya');

    try {
      const result = JSON.parse(content);
      logger.info(`Company interview questions generated for ${company}`);
      return result;
    } catch {
      return {
        questions: [
          `Tell me about yourself and why you want to join ${company}.`,
          `Describe a challenging project you worked on as a ${role}.`,
          `How do you handle tight deadlines and pressure?`,
          `What makes you a good fit for ${company}'s culture?`,
          `Where do you see yourself in 5 years at ${company}?`,
        ].slice(0, count),
        tips: [`Research ${company}'s core values before the interview.`, `Practice STAR format for behavioral questions.`],
        companyInfo: `${company} values strong technical skills and culture alignment.`,
      };
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429) {
      return {
        questions: Array.from({ length: count }, (_, i) => `${company} Question ${i + 1}: Describe your experience with ${role} responsibilities.`),
        tips: [`Research ${company}'s mission and values.`, 'Practice STAR method for behavioral questions.'],
        companyInfo: `${company} is known for rigorous technical and behavioral interviews.`,
      };
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Company interview generation mein problem: ${error.message}`);
  }
};

// ============================================
// JD (Job Description) parse karke custom interview generate karo
// ============================================
export const generateJDInterview = async (
  jobDescription: string,
  count: number = 5
): Promise<{ questions: string[]; extractedSkills: string[]; roleTitle: string; difficulty: string }> => {
  try {
    logger.info('JD-based interview generate ho raha hai');

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert technical recruiter. Analyze the job description and generate a targeted interview.

Return a JSON object with:
1. "roleTitle": Extracted job title from the JD
2. "extractedSkills": Array of 5-8 key skills/technologies extracted from the JD
3. "difficulty": Estimated difficulty level ("easy", "medium", or "hard") based on requirements
4. "questions": Array of exactly ${count} interview questions highly specific to the JD's requirements
   - Mix: 60% technical (based on listed skills), 40% behavioral/situational
   - Questions should directly reference technologies/requirements from the JD

Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nGenerate ${count} targeted interview questions.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new ApiError(500, 'AI se JD interview nahi aaya');

    try {
      const result = JSON.parse(content);
      logger.info(`JD interview generated - Role: ${result.roleTitle}, Skills: ${result.extractedSkills?.length}`);
      return result;
    } catch {
      return {
        roleTitle: 'Software Engineer',
        extractedSkills: ['JavaScript', 'React', 'Node.js'],
        difficulty: 'medium',
        questions: Array.from({ length: count }, (_, i) => `Question ${i + 1}: Based on the JD requirements, explain your experience with the listed technologies.`),
      };
    }
  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429) {
      return {
        roleTitle: 'Software Engineer',
        extractedSkills: ['JavaScript', 'Problem Solving', 'Communication'],
        difficulty: 'medium',
        questions: Array.from({ length: count }, (_, i) => `Question ${i + 1}: Describe your experience relevant to this role.`),
      };
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `JD interview generation mein problem: ${error.message}`);
  }
};

// ============================================
// Advanced ATS Score compute karo - 5 dimensions
// Full semantic analysis with section detection
// ============================================
export const computeAdvancedATSScore = async (
  resumeText: string,
  jobDescription?: string,
  targetRole?: string
): Promise<{
  totalScore: number;
  breakdown: {
    keywordMatch: { score: number; max: number; matchedKeywords: string[]; missingKeywords: string[] };
    sectionCompleteness: { score: number; max: number; presentSections: string[]; missingSections: string[] };
    formattingQuality: { score: number; max: number; issues: string[] };
    quantification: { score: number; max: number; examples: string[] };
    lengthOptimization: { score: number; max: number; wordCount: number; feedback: string };
  };
  grade: string;
  aiSuggestions: string[];
  isATSFriendly: boolean;
}> => {
  try {
    logger.info('Advanced ATS score compute ho raha hai');

    // --- SECTION COMPLETENESS (20 pts) ---
    const resumeLower = resumeText.toLowerCase();
    const sections = [
      { name: 'Contact Info', keywords: ['email', 'phone', 'linkedin', 'github', '@'] },
      { name: 'Summary/Objective', keywords: ['summary', 'objective', 'profile', 'about'] },
      { name: 'Experience', keywords: ['experience', 'work history', 'employment', 'worked at', 'company'] },
      { name: 'Education', keywords: ['education', 'degree', 'university', 'college', 'b.tech', 'b.e.', 'b.sc'] },
      { name: 'Skills', keywords: ['skills', 'technologies', 'tech stack', 'proficient', 'expertise'] },
    ];
    const presentSections: string[] = [];
    const missingSections: string[] = [];
    sections.forEach(s => {
      if (s.keywords.some(kw => resumeLower.includes(kw))) presentSections.push(s.name);
      else missingSections.push(s.name);
    });
    const sectionScore = Math.round((presentSections.length / sections.length) * 20);

    // --- QUANTIFICATION (10 pts) ---
    const quantRegex = /\b\d+[%\+xX]?\s*(percent|users|clients|projects|engineers|team|members|ms|seconds|hours|days|million|k|m)?/gi;
    const quantMatches = resumeText.match(quantRegex) || [];
    const quantScore = Math.min(10, quantMatches.length * 2);
    const quantExamples = quantMatches.slice(0, 3);

    // --- LENGTH (10 pts) ---
    const wordCount = resumeText.trim().split(/\s+/).length;
    let lengthScore = 0;
    let lengthFeedback = '';
    if (wordCount >= 400 && wordCount <= 700) { lengthScore = 10; lengthFeedback = 'Optimal length (400-700 words)'; }
    else if (wordCount >= 300 && wordCount <= 900) { lengthScore = 7; lengthFeedback = `${wordCount} words — slightly ${wordCount < 400 ? 'short' : 'long'}, aim for 400-700`; }
    else if (wordCount >= 200) { lengthScore = 4; lengthFeedback = `${wordCount} words — ${wordCount < 300 ? 'too short' : 'too long'} for most ATS systems`; }
    else { lengthScore = 1; lengthFeedback = `Only ${wordCount} words — significantly too short`; }

    // --- FORMATTING (20 pts) - basic heuristics ---
    const formattingIssues: string[] = [];
    let formattingScore = 20;
    if (!resumeText.includes('•') && !resumeText.includes('-') && !resumeText.includes('*')) {
      formattingIssues.push('No bullet points detected — use bullets for experience items');
      formattingScore -= 8;
    }
    if (resumeText.includes('|') && resumeText.split('|').length > 10) {
      formattingIssues.push('Tables detected — ATS systems cannot parse tables');
      formattingScore -= 7;
    }
    if (wordCount < 100) {
      formattingIssues.push('Resume appears very sparse — add more content');
      formattingScore -= 5;
    }
    formattingScore = Math.max(0, formattingScore);

    // --- KEYWORD MATCH (40 pts) via AI ---
    const keywordResponse = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an ATS (Applicant Tracking System) expert. Analyze a resume for keyword match.

${jobDescription ? `Job Description: ${jobDescription}\n` : ''}
${targetRole ? `Target Role: ${targetRole}\n` : ''}

Extract and compare:
1. "matchedKeywords": Array of important skills/keywords present in the resume (max 10)
2. "missingKeywords": Array of important keywords that are missing from the resume (max 8)
3. "aiSuggestions": Array of 4-5 specific, actionable improvement suggestions

Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Resume:\n${resumeText.substring(0, 3000)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const kwContent = keywordResponse.choices[0]?.message?.content?.trim() || '{}';
    let kwResult: any = { matchedKeywords: [], missingKeywords: [], aiSuggestions: [] };
    try { kwResult = JSON.parse(kwContent); } catch { /* use defaults */ }

    const keywordScore = Math.min(40, Math.round(
      (kwResult.matchedKeywords.length / Math.max(1, kwResult.matchedKeywords.length + kwResult.missingKeywords.length)) * 40
    ));

    const totalScore = keywordScore + sectionScore + formattingScore + quantScore + lengthScore;

    // Grade calculation
    let grade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B+';
    else if (totalScore >= 60) grade = 'B';
    else if (totalScore >= 50) grade = 'C';
    else if (totalScore >= 35) grade = 'D';

    logger.info(`Advanced ATS Score: ${totalScore}/100, Grade: ${grade}`);

    return {
      totalScore,
      breakdown: {
        keywordMatch: { score: keywordScore, max: 40, matchedKeywords: kwResult.matchedKeywords || [], missingKeywords: kwResult.missingKeywords || [] },
        sectionCompleteness: { score: sectionScore, max: 20, presentSections, missingSections },
        formattingQuality: { score: formattingScore, max: 20, issues: formattingIssues },
        quantification: { score: quantScore, max: 10, examples: quantExamples },
        lengthOptimization: { score: lengthScore, max: 10, wordCount, feedback: lengthFeedback },
      },
      grade,
      aiSuggestions: kwResult.aiSuggestions || [],
      isATSFriendly: totalScore >= 60,
    };
  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429) {
      const wc = resumeText.trim().split(/\s+/).length;
      const fallbackScore = Math.min(70, 30 + Math.round((wc / 700) * 30));
      return {
        totalScore: fallbackScore,
        breakdown: {
          keywordMatch: { score: 20, max: 40, matchedKeywords: ['skills', 'experience'], missingKeywords: ['quantification', 'action verbs'] },
          sectionCompleteness: { score: 15, max: 20, presentSections: ['Experience', 'Skills'], missingSections: ['Summary'] },
          formattingQuality: { score: 15, max: 20, issues: ['Add bullet points for better ATS parsing'] },
          quantification: { score: 4, max: 10, examples: [] },
          lengthOptimization: { score: 6, max: 10, wordCount: wc, feedback: `${wc} words` },
        },
        grade: fallbackScore >= 60 ? 'B' : 'C',
        aiSuggestions: ['Quantify your achievements with numbers.', 'Add a professional summary section.', 'Use strong action verbs.', 'Tailor skills to the job description.'],
        isATSFriendly: fallbackScore >= 60,
      };
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `ATS scoring mein problem: ${error.message}`);
  }
};