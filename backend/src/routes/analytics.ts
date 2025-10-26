import { Router } from 'express';
import {
  getOrganizationAnalytics,
  getUserStats,
  getCompletionTime,
  getAnalyticsDashboard
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Analytics endpoints
router.get('/dashboard', getAnalyticsDashboard);  // Comprehensive dashboard data
router.get('/organization', getOrganizationAnalytics);  // Detailed org analytics
router.get('/user', getUserStats);  // Current user's stats
router.get('/completion-time', getCompletionTime);  // Average completion time

export default router;

