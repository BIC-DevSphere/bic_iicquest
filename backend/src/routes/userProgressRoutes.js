import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  initializeProgress,
  getCourseProgress,
  updateLevelProgress,
  completeLevelTest,
  getUserProgress,
  completeChapter,
  completeCourse
} from '../controllers/userProgressController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Initialize progress for a course
router.post('/initialize', initializeProgress);

// Get course progress for current user
router.get('/course/:courseId', getCourseProgress);

// Update level progress
router.put('/level', updateLevelProgress);

// Complete level test
router.post('/complete-test', completeLevelTest);

// Get user's overall progress
router.get('/', getUserProgress);

// Complete chapter
router.post('/complete-chapter', completeChapter);

// Complete course
router.post('/complete-course', completeCourse);

export default router; 