import express from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const controller = new InterviewController();

router.use(authMiddleware);
router.post('/answer', controller.evaluate);

export default router;