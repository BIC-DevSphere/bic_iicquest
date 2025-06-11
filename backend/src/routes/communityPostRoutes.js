import express from 'express';
import { createCommunityPost, uploadMiddleware } from '../controllers/communityPostController.js';

const router = express.Router();

router.post('/create', uploadMiddleware, createCommunityPost);

export default router;
