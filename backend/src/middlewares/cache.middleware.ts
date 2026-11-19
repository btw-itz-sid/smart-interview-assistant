// ============================================
// Cache Middleware - In-memory caching
// Yeh middleware repeated requests ke response cache karta hai
// Taaki database pe baar baar load na aaye
// ============================================

import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

// NodeCache instance banao with configured TTL
const cache = new NodeCache({
  stdTTL: config.cache.stdTTL, // Default 5 minute cache
  checkperiod: config.cache.checkperiod, // Har 1 minute mein cleanup
});

const userPrefix = (userId: number | string) => `cache_${userId}_`;

// Cache middleware factory function
// Duration parameter se har route ka apna cache time set kar sakte ho
export const cacheMiddleware = (duration?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sirf GET requests cache karo - POST/PUT/DELETE nahi
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Key must include the user, otherwise one user's cached data is served to another
    const userId = (req as AuthRequest).user?.userId ?? 'anon';
    const key = `${userPrefix(userId)}${req.originalUrl}`;

    // Check karo cache mein data hai ya nahi
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Cache hit! - Database query ki zaroorat nahi
      logger.debug(`Cache HIT: ${key}`);
      res.json(cachedResponse);
      return;
    }

    // Cache miss - original response ko intercept karo aur cache mein daalo
    logger.debug(`Cache MISS: ${key}`);

    // Original json method ko override karo taaki response cache ho sake
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Sirf successful response cache karo, warna ek error poore TTL tak dikhta rahega
      if (res.statusCode < 400) cache.set(key, body, duration || config.cache.stdTTL);
      return originalJson(body);
    };

    next();
  };
};

// Ek user ka saara cached data clear karo
export const clearUserCache = (userId: number): void => {
  const prefix = userPrefix(userId);
  const keys = cache.keys().filter((key) => key.startsWith(prefix));
  cache.del(keys);
  logger.debug(`Cache cleared for user ${userId} (${keys.length} keys)`);
};

// Interview, answer ya resume save hone ke baad history/analytics purane na dikhein.
// req.user route-level auth middleware set karta hai, isliye response finish hone pe check karte hain.
export const clearUserCacheOnWrite = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      const userId = (req as AuthRequest).user?.userId;
      if (userId && res.statusCode < 400) clearUserCache(userId);
    });
  }
  next();
};
