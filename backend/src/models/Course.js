const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for content within a level
const ContentSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: {
    text: { 
      type: String, 
      required: true 
    },
    media: { 
      type: String,
      default: null 
    },
    examples: [{ 
      type: String 
    }]
  },
  order: { 
    type: Number, 
    required: true 
  }
});

// Schema for test cases within a level
const TestCaseSchema = new Schema({
  description: { 
    type: String, 
    required: true 
  },
  testCode: { 
    type: String, 
    required: true 
  },
  expectedOutput: { 
    type: String, 
    required: true 
  },
  hint: { 
    type: String 
  }
});

// Schema for individual levels within a chapter
const LevelSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  content: [ContentSchema],
  order: { 
    type: Number, 
    required: true 
  },
  estimatedTime: { 
    type: Number, // in minutes
    default: 30 
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  testCases: [TestCaseSchema],
  starterCode: {
    type: String,
    default: ''
  },
  solutionCode: {
    type: String,
    required: true
  },
  hints: [{
    type: String
  }]
});

// Schema for chapters within a course
const ChapterSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  levels: [LevelSchema],
  prerequisites: [{
    type: String
  }]
});

// Main course schema
const CourseSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  chapters: [ChapterSchema],
  tags: [{ 
    type: String 
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedHours: {
    type: Number,
    required: true
  },
  learningOutcomes: [{
    type: String,
    required: true
  }],
  requirements: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
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
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', CourseSchema); 