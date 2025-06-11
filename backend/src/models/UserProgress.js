import mongoose from 'mongoose';

// Schema for tracking test case completion
const TestCaseProgressSchema = new mongoose.Schema({
  testCase: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptedCode: {
    type: String
  },
  lastAttemptDate: {
    type: Date
  }
});

// Schema for tracking level progress
const LevelProgressSchema = new mongoose.Schema({
  level: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  testCaseProgress: [TestCaseProgressSchema],
  currentCode: {
    type: String
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: { // in minutes
    type: Number,
    default: 0
  }
});

// Schema for tracking chapter progress
const ChapterProgressSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  levelProgress: [LevelProgressSchema],
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: { // in minutes
    type: Number,
    default: 0
  }
});

// Main user progress schema
const UserProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
    default: 'not_started'
  },
  chapterProgress: [ChapterProgressSchema],
  currentChapter: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 0
  },
  overallProgress: {
    type: Number, // percentage
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  totalTimeSpent: { // in minutes
    type: Number,
    default: 0
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    }
  }
});

// Update lastAccessedAt on save
UserProgressSchema.pre('save', function(next) {
  this.lastAccessedAt = Date.now();
  next();
});

export default mongoose.model('UserProgress', UserProgressSchema); 