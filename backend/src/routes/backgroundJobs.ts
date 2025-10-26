import { Router } from 'express';
import {
  recomputeMetrics,
  getJobStatus,
  getJobs,
  getJobStats,
  deleteJob
} from '../controllers/backgroundJobsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All background job routes require authentication
router.use(authenticateToken);

// Background job endpoints
router.post('/recompute-metrics', recomputeMetrics);  // Trigger analytics recalculation
router.get('/stats', getJobStats);                    // Get job statistics
router.get('/status/:jobId', getJobStatus);          // Get specific job status
router.get('/', getJobs);                             // List all jobs
router.delete('/:jobId', deleteJob);                  // Delete a job

export default router;

