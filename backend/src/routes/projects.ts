import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';
import { validateProject } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/', validateProject, createProject);
router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:id', getProject);
router.put('/:id', validateProject, updateProject);
router.delete('/:id', deleteProject);

export default router;
