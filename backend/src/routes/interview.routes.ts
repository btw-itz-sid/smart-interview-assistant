import express from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { aiLimiter } from '../middlewares/rateLimit.middleware';

const router = express.Router();
const controller = new InterviewController();

router.use(authMiddleware);
router.post('/answer', aiLimiter, controller.evaluate);

export default router;