import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    required: true
  }],
  requiredTechnologies: [{
    name: {
      type: String,
      required: true
    },
    minimumProficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  }],
  isOpen: {
    type: Boolean,
    default: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    name: {
      type: String,
      required: true
    },
    minimumProficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  }],
  roles: [RoleSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isOpenForCollaboration: {
    type: Boolean,
    default: true
  },
  githubRepo: {
    type: String
  },
  liveDemo: {
    type: String
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'abandoned'],
    default: 'planning'
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Project', ProjectSchema); 