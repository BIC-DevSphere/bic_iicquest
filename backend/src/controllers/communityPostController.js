import CommunityPost from "../models/communityPost.js";
import multer from "multer";
import cloudinaryModule from 'cloudinary';
const cloudinary = cloudinaryModule.v2;
import streamifier from "streamifier";
import { GoogleGenAI } from '@google/genai';
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    secure: true,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (store file in memory, not disk)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Helper function to promisify cloudinary stream
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "community_posts" },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Create Community Post Controller with image upload support
export const createCommunityPost = async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }

        let imageUrl = "";

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const newCommunityPost = new CommunityPost({
            title,
            body,
            author: req.user.id,
            image: imageUrl
        });

        await newCommunityPost.save();

        const prompt = `${title}\n${body}\nGive me a brief answer in maximum 150 words.`;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
        });

        const aiText = geminiResponse.text;

        // 3️⃣ Create AI comment object
        const aiComment = {
            body: aiText,
            author: process.env.GEMINI_BOT_USER_ID, // 👈 AI author ID (create a dummy user for Gemini)
            postId: newCommunityPost._id,
            likes: 0,
            dislikes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // 4️⃣ Push AI comment to post's comments array
        newCommunityPost.comments.push(aiComment);
        newCommunityPost.totalComments = newCommunityPost.comments.length;

        await newCommunityPost.save();

        return res.status(201).json(newCommunityPost);
    } catch (error) {
        console.error(error);  // log for debugging
        res.status(400).json({ message: error.message });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        if (!req.body.body) {
            return res.status(400).json({ message: "Comment body is required" });
        }

        // First, add the comment and increment totalComments
        const updatedPost = await CommunityPost.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        body: req.body.body,
                        author: req.user.id,
                        post: req.params.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                },
                $inc: { totalComments: 1 }
            },
            { new: true }
        ).populate('author', 'username fullName name email')
            .populate('comments.author', 'username fullName name email');

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({
            message: "Comment added successfully",
            post: updatedPost
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Get all community posts
export const getCommunityPosts = async (req, res) => {
    try {
        const communityPosts = await CommunityPost.find()
            .populate('author', 'username fullName name email')
            .populate('comments.author', 'username fullName name email')
            .sort({ createdAt: -1 });

        res.status(200).json(communityPosts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Middleware for file upload
export const uploadMiddleware = upload.single("image");
