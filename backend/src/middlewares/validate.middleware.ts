// ============================================
// Validate Middleware - Centralized Zod Validation
// Request body ko schema se validate karta hai
// Ek jagah se saari validation handle hoti hai
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

// ============================================
// validateBody - Request body validate karne ke liye
// Schema pass karo aur yeh middleware validate karega
// Usage: router.post('/route', validateBody(mySchema), controller)
// ============================================
export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Body ko schema ke against validate karo
      const parsed = schema.parse(req.body);

      // Parsed (cleaned) data ko request mein replace karo
      // Isse extra fields automatically strip ho jaati hain
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod ke errors ko user-friendly format mein convert karo
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.') || 'unknown',
          message: err.message,
        }));

        logger.warn('Validation failed', { errors: formattedErrors });

        res.status(400).json({
          success: false,
          message: 'Galat data bheja hai - validate karo',
          errors: formattedErrors,
        });
        return;
      }

      // Koi aur error aaya toh aage bhej do
      next(error);
    }
  };
