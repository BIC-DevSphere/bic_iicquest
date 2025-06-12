import mongoose from 'mongoose';

const PeerInvitationSchema = new mongoose.Schema({
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  respondedAt: {
    type: Date
  },
  sessionId: {
    type: String // Will be populated when invitation is accepted
  },
  invitationData: {
    studyMode: {
      type: String,
      enum: ['guided', 'discussion', 'practice'],
      default: 'guided'
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60
    },
    preferredSettings: {
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
PeerInvitationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if invitation is expired
PeerInvitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Accept invitation
PeerInvitationSchema.methods.accept = function(sessionId) {
  this.status = 'accepted';
  this.respondedAt = new Date();
  this.sessionId = sessionId;
  return this;
};

// Decline invitation
PeerInvitationSchema.methods.decline = function() {
  this.status = 'declined';
  this.respondedAt = new Date();
  return this;
};

// Cancel invitation
PeerInvitationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.respondedAt = new Date();
  return this;
};

// Index for efficient queries
PeerInvitationSchema.index({ invitee: 1, status: 1, createdAt: -1 });
PeerInvitationSchema.index({ inviter: 1, status: 1, createdAt: -1 });
PeerInvitationSchema.index({ course: 1, status: 1 });
PeerInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PeerInvitation', PeerInvitationSchema); 