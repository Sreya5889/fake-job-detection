import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected auth profile endpoint
router.get('/me', requireAuth, getMe);

export default router;
