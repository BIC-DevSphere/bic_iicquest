import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  getUserById,
  updateLearningGoals
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', getUserById);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);
router.put('/learning-goals', auth, updateLearningGoals);

export default router; 