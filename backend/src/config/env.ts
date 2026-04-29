// ============================================
// Environment Config - Saari env variables yahan se access hoti hain
// Yeh file .env file ko validate karke ek config object banati hai
// ============================================

import dotenv from 'dotenv';

// .env file load karo
dotenv.config();

// Config object - poori app isse import karke env vars access karegi
export const config = {
  // Server settings
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database connection string
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT secret key - token sign aur verify karne ke liye
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtExpiresIn: '7d', // Token 7 din tak valid rahega

  // OpenAI API key - AI features ke liye zaroori hai
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // Rate limiting config
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minute ka window
    maxRequests: 100, // Ek IP se max 100 requests per window
  },

  // Cache config
  cache: {
    stdTTL: 300, // 5 minute ka default cache time
    checkperiod: 60, // Har 1 minute mein expired cache clean karo
  },
};

// Validate karo ki zaroori env variables set hain
export const validateEnv = (): void => {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} environment variable is not set.`);
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set. AI features will not work.');
  }
};