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
  applyForProject
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
router.patch('/:id/status', updateProjectStatus);

export default router; 