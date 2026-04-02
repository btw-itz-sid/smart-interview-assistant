// ============================================
// API Response Helper
// Yeh function consistent JSON response format
// maintain karta hai poori app mein
// ============================================

import { Response } from 'express';

// Standard success response bhejne ka function
// Har controller isse use karega taaki response format same rahe
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data || null,
  });
};
