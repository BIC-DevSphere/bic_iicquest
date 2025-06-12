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
,
  viewAllApplications,
  updateMessage,
  deleteMessage,
  createProjectGroupChat,
  sendMessage,
  getMessages
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.get('/application/:id', viewAllApplications);
router.get('/technology/:technology', getProjectsByTechnology);

// Protected routes
router.use(auth);
router.post('/', createProject);
router.put('/:id', updateProject);
router.post('/:id/apply', applyForRole);
router.get('/user/projects', getUserProjects);
router.post('/apply/:id', applyForProject);
router.put('/:id/status', updateProjectStatus);

// Project applications routes
router.get('/:id/applications', getProjectApplications);
router.put('/:projectId/applications/:applicationId/status', updateApplicationStatus);

// Chat Route
router.post('/:id/groupchat', createProjectGroupChat);
router.get('/groupchat/:groupChatId/messages', getMessages);
router.post('/groupchat/:id/message', sendMessage);
router.put('/groupchat/:groupChatId/message/:messageId', updateMessage);
router.delete('/groupchat/:groupChatId/message/:messageId', deleteMessage);
router.patch('/:id/status', updateProjectStatus);

export default router; 