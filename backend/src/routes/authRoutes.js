import { Router } from 'express';
import { register, login, demoLogin, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);

// Protected auth profile endpoint
router.get('/me', requireAuth, getMe);

export default router;
