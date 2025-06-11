import express from 'express';
import {
  getAllCourses,
  getCourseById,
  getCoursesByCategory,
  getCourseCountByCategory,
  searchCourses,
  getCoursesByLearningOutcome,
  createCourse,
  addChapter,
  addLevel,
  addContent,
  addTestCase,
  updateCourseStatus
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/search', searchCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/category-count', getCourseCountByCategory);
router.get('/learning-outcome', getCoursesByLearningOutcome);
router.get('/:id', getCourseById);

// Course creation routes
router.post('/', createCourse);
router.post('/:courseId/chapters', addChapter);
router.post('/:courseId/chapters/:chapterId/levels', addLevel);
router.post('/:courseId/chapters/:chapterId/levels/:levelId/content', addContent);
router.post('/:courseId/chapters/:chapterId/levels/:levelId/test-cases', addTestCase);
router.put('/:courseId/status', updateCourseStatus);

export default router; 