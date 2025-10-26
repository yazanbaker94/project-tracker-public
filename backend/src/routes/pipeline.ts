import { Router } from 'express';
import { pipelineCallback } from '../controllers/ingestionController';

const router = Router();

// Webhook callback endpoint (no authentication required - simulates external service)
router.post('/callback', pipelineCallback);

export default router;

