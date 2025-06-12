import PeerSession from '../models/PeerSession.js';
import PeerInvitation from '../models/PeerInvitation.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';

// Get potential peer matches for a user
export const getPeerMatches = async (req, res) => {
  try {
    const { courseId, chapterId, levelId } = req.params;
    const userId = req.user.id;

    // Get current user's data
    const currentUser = await User.findById(userId).populate('earnedTechnologies.name');
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get course data to find technologies
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get current user's progress for this course
    const currentUserProgress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    // Find users who are learning the same course and are available for collaboration
    const potentialPeers = await User.find({
      _id: { $ne: userId }, // Exclude current user
      isAvailableForCollaboration: true
    }).populate('earnedTechnologies.earnedFrom.course');

    // Filter users based on matching criteria
    const matchedPeers = [];

    for (const peer of potentialPeers) {
      // Check if peer has progress in the same course
      const peerProgress = await UserProgress.findOne({
        user: peer._id,
        course: courseId
      });

      if (!peerProgress) continue;

      // Calculate compatibility score
      let compatibilityScore = 0;
      let matchingFactors = [];

      // 1. Technology match (40% weight)
      const userTechnologies = currentUser.earnedTechnologies.map(tech => tech.name.toLowerCase());
      const peerTechnologies = peer.earnedTechnologies.map(tech => tech.name.toLowerCase());
      const courseTechnologies = course.technologies.map(tech => tech.name.toLowerCase());

      const techMatchCount = courseTechnologies.filter(tech => 
        userTechnologies.includes(tech) && peerTechnologies.includes(tech)
      ).length;

      if (techMatchCount > 0) {
        compatibilityScore += (techMatchCount / courseTechnologies.length) * 40;
        matchingFactors.push(`${techMatchCount} matching technologies`);
      }

      // 2. Progress similarity (30% weight)
      const userCompletedLevels = currentUserProgress?.chapterProgress?.reduce((count, chapter) => {
        return count + chapter.levelProgress.filter(level => level.status === 'completed').length;
      }, 0) || 0;

      const peerCompletedLevels = peerProgress?.chapterProgress?.reduce((count, chapter) => {
        return count + chapter.levelProgress.filter(level => level.status === 'completed').length;
      }, 0) || 0;

      const progressDifference = Math.abs(userCompletedLevels - peerCompletedLevels);
      if (progressDifference <= 3) { // Similar progress (within 3 levels)
        compatibilityScore += Math.max(0, 30 - (progressDifference * 5));
        matchingFactors.push('Similar progress level');
      }

      // 3. Course engagement (20% weight)
      const userTotalTime = currentUserProgress?.totalTimeSpent || 0;
      const peerTotalTime = peerProgress?.totalTimeSpent || 0;
      
      if (userTotalTime > 0 && peerTotalTime > 0) {
        const timeRatio = Math.min(userTotalTime, peerTotalTime) / Math.max(userTotalTime, peerTotalTime);
        compatibilityScore += timeRatio * 20;
        matchingFactors.push('Similar engagement level');
      }

      // 4. Online activity (10% weight)
      const lastActivity = peerProgress?.lastAccessedAt;
      if (lastActivity) {
        const daysSinceLastActivity = (Date.now() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastActivity <= 7) { // Active within last week
          compatibilityScore += Math.max(0, 10 - daysSinceLastActivity);
          matchingFactors.push('Recently active');
        }
      }

      // Only include peers with minimum compatibility score
      if (compatibilityScore >= 30) {
        matchedPeers.push({
          user: {
            _id: peer._id,
            username: peer.username,
            fullName: peer.fullName,
            profilePicture: peer.profilePicture,
            bio: peer.bio
          },
          compatibility: {
            score: Math.round(compatibilityScore),
            factors: matchingFactors
          },
          progress: {
            completedLevels: peerCompletedLevels,
            totalTimeSpent: peerTotalTime,
            lastAccessedAt: peerProgress.lastAccessedAt
          },
          technologies: peer.earnedTechnologies.map(tech => tech.name),
          isOnline: peer.lastSeen && (Date.now() - new Date(peer.lastSeen)) < 15 * 60 * 1000 // Online within 15 minutes
        });
      }
    }

    // Sort by compatibility score (highest first)
    matchedPeers.sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.status(200).json({
      matches: matchedPeers.slice(0, 10), // Return top 10 matches
      total: matchedPeers.length,
      course: {
        _id: course._id,
        title: course.title,
        technologies: course.technologies
      },
      currentUser: {
        completedLevels: currentUserProgress?.chapterProgress?.reduce((count, chapter) => {
          return count + chapter.levelProgress.filter(level => level.status === 'completed').length;
        }, 0) || 0,
        technologies: currentUser.earnedTechnologies.map(tech => tech.name)
      }
    });
  } catch (error) {
    console.error('Error finding peer matches:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send peer learning invitation
export const sendPeerInvitation = async (req, res) => {
  try {
    const { 
      inviteeId, 
      courseId, 
      chapterId, 
      levelId, 
      sessionType, 
      message,
      studyMode,
      estimatedDuration,
      settings
    } = req.body;
    const inviterId = req.user.id;

    // Validate that inviter and invitee are different
    if (inviterId === inviteeId) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    // Check if invitee exists and is available for collaboration
    const invitee = await User.findById(inviteeId);
    if (!invitee) {
      return res.status(404).json({ message: 'Invitee not found' });
    }

    if (!invitee.isAvailableForCollaboration) {
      return res.status(400).json({ message: 'User is not available for collaboration' });
    }

    // Check if there's already a pending invitation between these users for this level
    const existingInvitation = await PeerInvitation.findOne({
      $or: [
        { inviter: inviterId, invitee: inviteeId },
        { inviter: inviteeId, invitee: inviterId }
      ],
      course: courseId,
      chapter: chapterId,
      level: levelId,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'There is already a pending invitation for this level' });
    }

    // Create new invitation
    const invitation = new PeerInvitation({
      inviter: inviterId,
      invitee: inviteeId,
      course: courseId,
      chapter: chapterId,
      level: levelId,
      sessionType: sessionType || 'content_learning',
      message: message || '',
      invitationData: {
        studyMode: studyMode || 'guided',
        estimatedDuration: estimatedDuration || 60,
        preferredSettings: {
          allowVoiceNotes: settings?.allowVoiceNotes ?? true,
          allowScreenShare: settings?.allowScreenShare ?? true,
          syncNavigation: settings?.syncNavigation ?? true,
          collaborativeNotes: settings?.collaborativeNotes ?? true
        }
      }
    });

    await invitation.save();

    // Populate invitation with user and course data
    const populatedInvitation = await PeerInvitation.findById(invitation._id)
      .populate('inviter', 'username fullName profilePicture')
      .populate('invitee', 'username fullName profilePicture')
      .populate('course', 'title description');

    res.status(201).json({
      invitation: populatedInvitation,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error sending peer invitation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get received invitations for current user
export const getReceivedInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'pending' } = req.query;

    const invitations = await PeerInvitation.find({
      invitee: userId,
      status: status,
      expiresAt: { $gt: new Date() } // Only non-expired invitations1m
    })
    .populate('inviter', 'username fullName profilePicture bio')
    .populate('course', 'title description technologies')
    .sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Error fetching received invitations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get sent invitations for current user
export const getSentInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'pending' } = req.query;

    const invitations = await PeerInvitation.find({
      inviter: userId,
      status: status
    })
    .populate('invitee', 'username fullName profilePicture bio')
    .populate('course', 'title description technologies')
    .sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Respond to peer invitation (accept/decline)
export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.id;

    const invitation = await PeerInvitation.findById(invitationId)
      .populate('inviter', 'username fullName profilePicture')
      .populate('course', 'title description');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if current user is the invitee
    if (invitation.invitee.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this invitation' });
    }

    // Check if invitation is still pending and not expired
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been responded to' });
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    if (action === 'accept') {
      // Create new peer session
      const session = new PeerSession({
        course: invitation.course._id,
        chapter: invitation.chapter,
        level: invitation.level,
        sessionType: invitation.sessionType,
        studyMode: invitation.invitationData.studyMode,
        settings: invitation.invitationData.preferredSettings
      });

      session.generateSessionId();
      session.addParticipant(invitation.inviter._id, 'leader');
      session.addParticipant(invitation.invitee, 'participant');

      // Add initial system message
      session.addMessage(
        invitation.inviter._id,
        `🚀 Peer learning session started! Welcome ${invitation.inviter.fullName}!`,
        'system'
      );

      await session.save();

      // Update invitation
      invitation.accept(session.sessionId);
      await invitation.save();

      const populatedSession = await PeerSession.findById(session._id)
        .populate('participants.user', 'username fullName profilePicture')
        .populate('course', 'title description');

      // Import the socket emitter and notify the invitation sender
      const { emitToUser } = await import('../sockets/peerLearningSocket.js');
      
      // Notify the invitation sender via WebSocket
      const notificationSent = emitToUser(invitation.inviter._id.toString(), 'invitation-accepted-notification', {
        invitation: invitation,
        session: populatedSession,
        sessionId: session.sessionId,
        message: `${invitation.invitee.fullName || 'Someone'} accepted your invitation!`,
        timestamp: new Date().toISOString()
      });

      console.log(`WebSocket notification sent to inviter ${invitation.inviter._id}: ${notificationSent}`);

      res.status(200).json({
        message: 'Invitation accepted successfully',
        session: populatedSession,
        sessionId: session.sessionId
      });
    } else if (action === 'decline') {
      invitation.decline();
      await invitation.save();

      res.status(200).json({
        message: 'Invitation declined successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "accept" or "decline"' });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get active peer sessions for current user
export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await PeerSession.find({
      'participants.user': userId,
      status: 'active'
    })
    .populate('participants.user', 'username fullName profilePicture')
    .populate('course', 'title description')
    .sort({ 'sessionData.startTime': -1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await PeerSession.findOne({ sessionId })
      .populate('participants.user', 'username fullName profilePicture bio')
      .populate('course', 'title description technologies')
      .populate('messages.sender', 'username fullName')
      .populate('collaborativeNotes.author', 'username fullName')
      .populate('studyQuestions.askedBy', 'username fullName')
      .populate('reactions.sender', 'username fullName');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if current user is a participant
    const isParticipant = session.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this session' });
    }

    // Update user's last seen time
    const participant = session.participants.find(p => p.user._id.toString() === userId);
    if (participant) {
      participant.lastSeen = new Date();
      participant.isOnline = true;
      await session.save();
    }

    res.status(200).json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add message to session
export const addMessageToSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text, type = 'message' } = req.body;
    const userId = req.user.id;

    const session = await PeerSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is a participant
    const isParticipant = session.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to add messages to this session' });
    }

    session.addMessage(userId, text, type);
    await session.save();

    const populatedSession = await PeerSession.findById(session._id)
      .populate('messages.sender', 'username fullName profilePicture');

    const newMessage = populatedSession.messages[populatedSession.messages.length - 1];

    res.status(200).json({ 
      message: 'Message added successfully',
      newMessage 
    });
  } catch (error) {
    console.error('Error adding message to session:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update session progress
export const updateSessionProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentContentIndex, progressPercentage } = req.body;
    const userId = req.user.id;

    const session = await PeerSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is a participant and has leader role for navigation
    const participant = session.participants.find(p => p.user._id.toString() === userId);
    if (!participant) {
      return res.status(403).json({ message: 'Not authorized to update session progress' });
    }

    // Update session progress
    session.sessionData.currentContentIndex = currentContentIndex;
    
    // Update individual user progress
    const userProgress = session.sessionProgress.find(p => p.user.toString() === userId);
    if (userProgress) {
      userProgress.currentContentIndex = currentContentIndex;
      userProgress.progressPercentage = progressPercentage;
      userProgress.lastSeen = new Date();
    } else {
      session.sessionProgress.push({
        user: userId,
        currentContentIndex,
        progressPercentage,
        lastSeen: new Date()
      });
    }

    session.updateDuration();
    await session.save();

    res.status(200).json({ 
      message: 'Progress updated successfully',
      currentContentIndex: session.sessionData.currentContentIndex
    });
  } catch (error) {
    console.error('Error updating session progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a collaborative test session
export const createTestSession = async (req, res) => {
  try {
    const { courseId, chapterId, levelId, inviteUserId } = req.body;
    const userId = req.user.id;

    // Create test session
    const session = new PeerSession({
      course: courseId,
      chapter: chapterId,
      level: levelId,
      sessionType: 'collaborative_test',
      studyMode: 'practice'
    });

    session.generateSessionId();
    session.addParticipant(userId, 'leader');
    
    if (inviteUserId) {
      session.addParticipant(inviteUserId, 'participant');
    }

    // Add initial system message
    session.addMessage(
      userId,
      '🧪 Collaborative test session started! Work together to solve the coding challenge.',
      'system'
    );

    await session.save();

    const populatedSession = await PeerSession.findById(session._id)
      .populate('participants.user', 'username fullName profilePicture')
      .populate('course', 'title description');

    res.status(201).json({
      message: 'Test session created successfully',
      session: populatedSession
    });
  } catch (error) {
    console.error('Error creating test session:', error);
    res.status(500).json({ message: error.message });
  }
};

// End peer session
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await PeerSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is a participant
    const isParticipant = session.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to end this session' });
    }

    session.status = 'completed';
    session.sessionData.endTime = new Date();
    session.updateDuration();

    // Mark all participants as offline
    session.participants.forEach(participant => {
      participant.isOnline = false;
      participant.lastSeen = new Date();
    });

    await session.save();

    res.status(200).json({ 
      message: 'Session ended successfully',
      sessionInsights: session.sessionInsights
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel invitation (for inviter)
export const cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await PeerInvitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if current user is the inviter
    if (invitation.inviter.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this invitation' });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel invitation that has already been responded to' });
    }

    invitation.cancel();
    await invitation.save();

    res.status(200).json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user availability for collaboration
export const updateCollaborationAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAvailableForCollaboration = isAvailable;
    await user.save();

    res.status(200).json({ 
      message: `Collaboration availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      isAvailableForCollaboration: user.isAvailableForCollaboration
    });
  } catch (error) {
    console.error('Error updating collaboration availability:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get session notifications for current user (when invitations are accepted)
export const getSessionNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Checking session notifications for user:', userId);

    // Find recently accepted invitations where current user was the inviter
    // Extended to 10 minutes to ensure we catch recent acceptances
    const recentlyAccepted = await PeerInvitation.find({
      inviter: userId,
      status: 'accepted',
      updatedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
    })
    .populate('invitee', 'username fullName profilePicture')
    .populate('course', 'title description')
    .sort({ updatedAt: -1 });

    console.log(`Found ${recentlyAccepted.length} recently accepted invitations`);

    // Get session data for these invitations
    const notifications = [];
    for (const invitation of recentlyAccepted) {
      console.log('Processing invitation:', invitation._id, 'sessionId:', invitation.sessionId);
      
      if (invitation.sessionId) {
        try {
          const session = await PeerSession.findOne({ sessionId: invitation.sessionId })
            .populate('participants.user', 'username fullName profilePicture');
          
          console.log('Found session:', session ? session.sessionId : 'null', 'status:', session?.status);
          
          if (session && session.status === 'active') {
            notifications.push({
              type: 'invitation_accepted',
              invitation: invitation,
              session: session,
              message: `${invitation.invitee.fullName} accepted your invitation!`,
              timestamp: invitation.updatedAt
            });
          }
        } catch (sessionError) {
          console.error('Error finding session:', sessionError);
        }
      }
    }

    console.log(`Returning ${notifications.length} notifications`);
    
    // If no notifications found, let's check what invitations exist
    if (notifications.length === 0) {
      const allInvitations = await PeerInvitation.find({ inviter: userId })
        .populate('invitee', 'username fullName')
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log('Recent invitations for debugging:', allInvitations.map(inv => ({
        id: inv._id,
        status: inv.status,
        sessionId: inv.sessionId,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        invitee: inv.invitee.fullName
      })));
    }
    
    res.status(200).json({ 
      notifications,
      debug: {
        userId,
        acceptedInvitationsCount: recentlyAccepted.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching session notifications:', error);
    res.status(500).json({ message: error.message });
  }
}; 