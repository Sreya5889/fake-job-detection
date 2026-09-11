import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Enforce JWT authentication on dashboard routes
router.use(requireAuth);

router.get('/stats', getStats);

export default router;
