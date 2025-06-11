import mongoose from 'mongoose';

const skillsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  skillAcquiredDate: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
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
  skills: [skillsSchema],
  earnedTechnologies: [{
    name: {
      type: String,
      required: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    earnedFrom: {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
      earnedAt: {
        type: Date,
        default: Date.now
      }
    },
    description: {
      type: String,
      required: true
    }
  }],
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['course_completion', 'project_creation', 'collaboration', 'achievement'],
      required: true
    }
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

export default mongoose.model('User', UserSchema); 