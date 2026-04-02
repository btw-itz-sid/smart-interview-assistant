// ============================================
// Async Handler - Express async errors handle karne ke liye
// Yeh wrapper har async controller function ke around
// try-catch lagata hai automatically
// ============================================

import { Request, Response, NextFunction } from 'express';

// asyncHandler ek higher-order function hai
// Jo kisi bhi async function ko wrap karta hai
// Agar async function mein error aaye toh next() se error middleware ko bhejta hai
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve se wrap karke .catch lagaya hai
    // Taaki koi bhi unhandled error automatically catch ho jaaye
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
