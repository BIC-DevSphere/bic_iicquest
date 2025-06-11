import express from 'express';
import { 
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  applyForRole,
  getProjectsByTechnology,
  getUserProjects,
  updateProjectStatus,
  applyForProject,
  getProjectApplications,
  updateApplicationStatus
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.get('/technology/:technology', getProjectsByTechnology);

// Protected routes
router.use(auth);
router.post('/', createProject);
router.put('/:id', updateProject);
router.post('/:id/apply', applyForRole);
router.get('/user/projects', getUserProjects);
router.post('/user/projects/apply/:id', applyForProject);
router.put('/:id/status', updateProjectStatus);

// Project applications routes
router.get('/:id/applications', getProjectApplications);
router.put('/:projectId/applications/:applicationId/status', updateApplicationStatus);

export default router; 