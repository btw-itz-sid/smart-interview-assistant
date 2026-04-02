// ============================================
// Auth Routes - /api/auth/*
// Validate middleware se input validate hota hai pehle
// ============================================

import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../models/validation';

const router = Router();

// POST /api/auth/register - Naya user banao
router.post('/register', validateBody(registerSchema), register);

// POST /api/auth/login - Login karo, token lo
router.post('/login', validateBody(loginSchema), login);

// GET /api/auth/profile - Apna profile dekho (login required)
router.get('/profile', authMiddleware, getProfile);

export default router;
