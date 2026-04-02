import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';

export class InterviewController {
  async evaluate(req: Request, res: Response) {
    try {
      const { question, answer, topic = 'general' } = req.body;
      const result = await aiService.evaluateAnswer(question, answer, topic);

      res.json({
        success: true,
        feedback: result.evaluation,
        score: result.score,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to evaluate answer',
      });
    }
  }
}