// ============================================
// Cache Middleware - In-memory caching
// Yeh middleware repeated requests ke response cache karta hai
// Taaki database pe baar baar load na aaye
// ============================================

import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// NodeCache instance banao with configured TTL
const cache = new NodeCache({
  stdTTL: config.cache.stdTTL, // Default 5 minute cache
  checkperiod: config.cache.checkperiod, // Har 1 minute mein cleanup
});

// Cache middleware factory function
// Duration parameter se har route ka apna cache time set kar sakte ho
export const cacheMiddleware = (duration?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sirf GET requests cache karo - POST/PUT/DELETE nahi
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Cache key banao - URL + query params se unique key banti hai
    const key = `cache_${req.originalUrl}`;

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
      // Response ko cache mein store karo
      cache.set(key, body, duration || config.cache.stdTTL);
      return originalJson(body);
    };

    next();
  };
};

// Specific key ya pattern ka cache clear karne ka function
// Jab data update ho toh purana cache clear karna padta hai
export const clearCache = (pattern?: string): void => {
  if (pattern) {
    // Pattern match karne wali saari keys delete karo
    const keys = cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    matchingKeys.forEach((key) => cache.del(key));
    logger.debug(`Cache cleared for pattern: ${pattern}`);
  } else {
    // Poora cache saaf karo
    cache.flushAll();
    logger.debug('Poora cache clear ho gaya');
  }
};
