import express from 'express';
import { createCommunityPost, uploadMiddleware, getCommunityPosts, commentOnPost } from '../controllers/communityPostController.js';
import { askGemini } from '../controllers/askGeminiController.js';

const router = express.Router();
import { auth } from '../middleware/auth.js';

router.post('/askgemini', askGemini);

router.use(auth);

router.post('/', uploadMiddleware, createCommunityPost);
router.get('/', getCommunityPosts);
router.post('/comment/:id', commentOnPost);

export default router;
