import { Router } from 'express';
import {
  analyzeText,
  analyzeUrl,
  analyzeImage,
  analyzeVoice,
  getHistory,
  getAnalysis,
  removeAnalysis
} from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadImage, uploadAudio } from '../middleware/uploadMiddleware.js';

const router = Router();

// Enforce JWT authentication on all analysis routes
router.use(requireAuth);

// Multi-modal analysis submission endpoints
router.post('/text', analyzeText);
router.post('/url', analyzeUrl);
router.post('/image', uploadImage.single('image'), analyzeImage);
router.post('/voice', uploadAudio.single('audio'), analyzeVoice);

// History & Report Management
router.get('/history', getHistory);
router.get('/:id', getAnalysis);
router.delete('/:id', removeAnalysis);

export default router;
