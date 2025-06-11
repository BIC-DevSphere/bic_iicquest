import express from 'express';
import {
  initializeProgress,
  updateTestCaseProgress,
  getCourseProgress,
  getAllProgress,
  updateTimeSpent,
  abandonCourse
} from '../controllers/userProgressController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

router.post('/initialize', initializeProgress);
router.get('/course/:courseId', getCourseProgress);
router.get('/all', getAllProgress);
router.put('/test-case', updateTestCaseProgress);
router.put('/time-spent', updateTimeSpent);
router.put('/abandon/:courseId', abandonCourse);

export default router; 