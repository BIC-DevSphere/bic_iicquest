import express from 'express';
import {
  getAllCourses,
  getCourseById,
  getCoursesByCategory,
  getCourseCountByCategory,
  searchCourses,
  getCoursesByLearningOutcome
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/search', searchCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/category-count', getCourseCountByCategory);
router.get('/learning-outcome', getCoursesByLearningOutcome);
router.get('/:id', getCourseById);

export default router; 