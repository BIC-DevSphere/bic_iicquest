import mongoose from "mongoose";

export const communityPostSchema = new mongoose.Schema({
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
})