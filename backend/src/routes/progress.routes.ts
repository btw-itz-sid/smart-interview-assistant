// ============================================
// Progress Routes - Analytics aur progress ke endpoints
// /api/progress/* pe accessible hain
// Saare routes protected hain
// ============================================

import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Saare progress routes pe auth zaroori hai
router.use(authMiddleware);

// GET /api/progress/analytics - Complete analytics with caching
// 60 second ka cache lagaya hai taaki har request pe DB query na ho
router.get(
  '/analytics',
  cacheMiddleware(60),
  progressController.getAnalytics
);

// GET /api/progress/topics - Topic-wise progress with caching
router.get(
  '/topics',
  cacheMiddleware(60),
  progressController.getTopicProgress
);

export default router;
