import { Router } from 'express';
import {
  initUpload,
  getJobStatus,
  getUserJobs,
  getOrganizationJobs,
  getIngestionStats,
  deleteJob
} from '../controllers/ingestionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All ingestion routes require authentication (except callback)
router.use(authenticateToken);

// Ingestion endpoints
router.post('/init', initUpload);  // Initialize file upload
router.get('/jobs', getUserJobs);  // Get current user's jobs
router.get('/jobs/all', getOrganizationJobs);  // Get all org jobs
router.get('/stats', getIngestionStats);  // Get ingestion statistics
router.get('/status/:jobId', getJobStatus);  // Get specific job status
router.delete('/:jobId', deleteJob);  // Delete a job

export default router;

