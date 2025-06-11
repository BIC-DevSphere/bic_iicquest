import CommunityPost from "../models/communityPost.js";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

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
        const { title, body, author } = req.body;

        let imageUrl = "";

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const newCommunityPost = new CommunityPost({
            title,
            body,
            author,
            image: imageUrl
        });

        await newCommunityPost.save();
        return res.status(201).json(newCommunityPost);
    } catch (error) {
        console.error(error);  // log for debugging
        res.status(400).json({ message: error.message });
    }
};

// Get all community posts
export const getCommunityPosts = async (req, res) => {
    try {
        const communityPosts = await CommunityPost.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(communityPosts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Middleware for file upload
export const uploadMiddleware = upload.single("image");
