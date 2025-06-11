import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
})

const communityPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: false,
        default: "",
    },
    comments: {
        type: [CommentSchema],
        required: false,
    },
    totalComments: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model('CommunityPost', communityPostSchema);