import express from "express";
import { createCommunityPost, getCommunityPosts, uploadMiddleware } from "../controllers/communityPostController.js";

const router = express.Router();

router.post("/create", uploadMiddleware, createCommunityPost);
router.get("/", getCommunityPosts);

export default router;
