import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'system', 'question', 'invitation', 'achievement', 'hint', 'action'],
    default: 'message'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const collaborativeNoteSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentIndex: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const studyQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentIndex: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  answers: [{
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answer: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentIndex: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const goalSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const sessionProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentContentIndex: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
});

const PeerSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'participant'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  }],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['content_learning', 'collaborative_test', 'discussion'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  studyMode: {
    type: String,
    enum: ['guided', 'discussion', 'practice'],
    default: 'guided'
  },
  settings: {
    allowVoiceNotes: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    syncNavigation: {
      type: Boolean,
      default: true
    },
    collaborativeNotes: {
      type: Boolean,
      default: true
    }
  },
  sessionData: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    currentContentIndex: {
      type: Number,
      default: 0
    },
    totalContentSections: {
      type: Number,
      default: 0
    }
  },
  messages: [messageSchema],
  collaborativeNotes: [collaborativeNoteSchema],
  studyQuestions: [studyQuestionSchema],
  reactions: [reactionSchema],
  sessionGoals: [goalSchema],
  sessionProgress: [sessionProgressSchema],
  sharedCode: {
    content: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'python'
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  testResults: {
    participant1: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      results: [{
        testCase: String,
        passed: Boolean,
        executionTime: Number,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }],
      allTestsPassed: {
        type: Boolean,
        default: false
      }
    },
    participant2: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      results: [{
        testCase: String,
        passed: Boolean,
        executionTime: Number,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }],
      allTestsPassed: {
        type: Boolean,
        default: false
      }
    }
  },
  sessionInsights: {
    totalMessages: {
      type: Number,
      default: 0
    },
    questionsAsked: {
      type: Number,
      default: 0
    },
    notesCreated: {
      type: Number,
      default: 0
    },
    reactionsGiven: {
      type: Number,
      default: 0
    },
    codeShareCount: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number, // in minutes
      default: 0
    }
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
PeerSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate session ID
PeerSessionSchema.methods.generateSessionId = function() {
  this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Add participant
PeerSessionSchema.methods.addParticipant = function(userId, role = 'participant') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      isOnline: true
    });
  }
  return this;
};

// Remove participant
PeerSessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this;
};

// Add message
PeerSessionSchema.methods.addMessage = function(senderId, text, type = 'message') {
  this.messages.push({
    sender: senderId,
    text: text,
    type: type,
    timestamp: new Date()
  });
  this.sessionInsights.totalMessages = this.messages.length;
  return this;
};

// Add study question
PeerSessionSchema.methods.addStudyQuestion = function(userId, question, contentIndex) {
  this.studyQuestions.push({
    question: question,
    askedBy: userId,
    contentIndex: contentIndex,
    timestamp: new Date()
  });
  this.sessionInsights.questionsAsked = this.studyQuestions.length;
  return this;
};

// Add reaction
PeerSessionSchema.methods.addReaction = function(userId, emoji, contentIndex) {
  this.reactions.push({
    emoji: emoji,
    sender: userId,
    contentIndex: contentIndex,
    timestamp: new Date()
  });
  this.sessionInsights.reactionsGiven = this.reactions.length;
  return this;
};

// Update session duration
PeerSessionSchema.methods.updateDuration = function() {
  if (this.sessionData.startTime) {
    const now = new Date();
    this.sessionInsights.sessionDuration = Math.floor((now - this.sessionData.startTime) / (1000 * 60));
  }
  return this;
};

export default mongoose.model('PeerSession', PeerSessionSchema); 