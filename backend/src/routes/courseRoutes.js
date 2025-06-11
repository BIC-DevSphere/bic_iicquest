import express from 'express';
import { auth } from '../middleware/auth.js';
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
  updateCourseStatus,
  getChapters,
  getChapterById,
  getLevels,
  getLevelById,
  getLevelContent,
  getLevelTestCases,
  getNextLevel
} from '../controllers/courseController.js';

const router = express.Router();
router.use(auth);

// Public course discovery routes
router.get('/', getAllCourses);
router.get('/search', searchCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/category-count', getCourseCountByCategory);
router.get('/learning-outcome', getCoursesByLearningOutcome);
router.get('/:id', getCourseById);

// Course structure routes
router.get('/:courseId/chapters', getChapters);
router.get('/:courseId/chapters/:chapterId', getChapterById);
router.get('/:courseId/chapters/:chapterId/levels', getLevels);
router.get('/:courseId/chapters/:chapterId/levels/:levelId', getLevelById);
router.get('/:courseId/chapters/:chapterId/levels/:levelId/content', getLevelContent);
router.get('/:courseId/chapters/:chapterId/levels/:levelId/test-cases', getLevelTestCases);
router.get('/:courseId/chapters/:chapterId/levels/:levelId/next', getNextLevel);

// Course creation routes (admin only)
router.post('/', createCourse);
router.post('/:courseId/chapters', addChapter);
router.post('/:courseId/chapters/:chapterId/levels', addLevel);
router.post('/:courseId/chapters/:chapterId/levels/:levelId/content', addContent);
router.post('/:courseId/chapters/:chapterId/levels/:levelId/test-cases', addTestCase);
router.put('/:courseId/status', updateCourseStatus);

export default router; 