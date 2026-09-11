import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Enforce JWT authentication on user profile routes
router.use(requireAuth);

router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;
