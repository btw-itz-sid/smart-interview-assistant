// ============================================
// Progress Routes — Analytics, streaks, badges, readiness
// /api/progress/* — All routes protected
// ============================================

import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.use(authMiddleware);

// Dashboard analytics (60s cache)
router.get('/analytics', cacheMiddleware(60), progressController.getAnalytics);

// Topic-wise progress (60s cache)
router.get('/topics', cacheMiddleware(60), progressController.getTopicProgress);

// Streak & XP data
router.get('/streak', progressController.getStreak);

// Badges (earned + locked)
router.get('/badges', progressController.getBadges);

// Interview Readiness Score (composite)
router.get('/readiness', cacheMiddleware(30), progressController.getReadinessScore);

export default router;
