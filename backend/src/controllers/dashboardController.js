import { getDashboardStats } from '../services/analysisService.js';
import { successResponse } from '../utils/response.js';

/**
 * Retrieve dashboard analytics for the authenticated user
 * GET /api/dashboard/stats
 */
export async function getStats(req, res, next) {
  try {
    const stats = await getDashboardStats(req.user.id);
    return successResponse(res, stats);
  } catch (err) {
    next(err);
  }
}
