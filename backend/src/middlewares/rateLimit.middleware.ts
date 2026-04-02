// ============================================
// Rate Limiter Middleware
// Yeh middleware ek IP se bohot zyada requests aane se rokta hai
// DDoS attacks aur API abuse se protection deta hai
// ============================================

import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// General rate limiter - saari routes ke liye
// Ek IP se 15 minute mein max 100 requests allow hain
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minute ka window
  max: config.rateLimit.maxRequests, // Max requests per window
  message: {
    success: false,
    message: 'Bohot zyada requests bhej rahe ho - 15 minute baad try karo',
  },
  standardHeaders: true, // Rate limit info headers mein bhejo
  legacyHeaders: false,
});

// Auth routes ke liye strict limiter
// Login/Register pe zyada strict limit lagayi hai brute force se bachne ke liye
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 20, // Sirf 20 attempts per 15 minute
  message: {
    success: false,
    message: 'Login attempts ki limit cross ho gayi - 15 minute baad try karo',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI routes ke liye limiter
// AI calls expensive hain isliye zyada strict limit hai
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 30, // Max 30 AI calls per 15 minute
  message: {
    success: false,
    message: 'AI requests ki limit cross ho gayi - thodi der baad try karo',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
