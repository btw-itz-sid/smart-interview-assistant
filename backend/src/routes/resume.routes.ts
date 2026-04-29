// ============================================
// Resume Routes - /api/resume/*
// Validate middleware use karke input validate karta hai
// ============================================

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { resumeAnalyzeSchema } from '../models/validation';
import { analyzeResume, suggestTopics, uploadResume, generateResume, advancedATSScore } from '../controllers/resume.controller';
import multer from 'multer';

// Set up memory storage for PDF parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


const router = Router();

// Sabhi resume routes ke liye auth required hai
router.use(authMiddleware);

// POST /api/resume/analyze - Resume analyze karo
router.post('/analyze', validateBody(resumeAnalyzeSchema), analyzeResume);

// POST /api/resume/suggest-topics - Resume se interview topics suggest karo
router.post('/suggest-topics', validateBody(resumeAnalyzeSchema), suggestTopics);

// POST /api/resume/upload - PDF resume upload and extract text
router.post('/upload', upload.single('resume'), uploadResume);

// POST /api/resume/generate - Auto generate baseline resume
router.post('/generate', generateResume);

// POST /api/resume/ats-score - Advanced 5-dimension ATS score
router.post('/ats-score', advancedATSScore);

export default router;
