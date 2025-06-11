import mongoose from 'mongoose';

const membersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
});

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isEdited: {
        type: Boolean,
        default: false,
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

const GroupChatSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    groupName: {
        type: String,
        required: false,
        unique: true,
    },
    members: [membersSchema],
    messages: [messageSchema],
    isActive:{
        type: Boolean,
        required: false,
        default: true,
    }
});

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

export default GroupChat;
