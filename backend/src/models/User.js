import mongoose from 'mongoose';
import Schema from mongoose.Schema;

const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true,
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  fullName: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String,
    default: '' 
  },
  skills: [{ 
    type: String 
  }],
  interests: [{ 
    type: String 
  }],
  currentLearningGoals: [{
    topic: { type: String },
    targetDate: { type: Date }
  }],
  profilePicture: {
    type: String,
    default: null
  },
  isAvailableForCollaboration: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema); 