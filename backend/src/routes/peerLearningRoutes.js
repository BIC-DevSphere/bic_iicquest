import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPeerMatches,
  sendPeerInvitation,
  getReceivedInvitations,
  getSentInvitations,
  respondToInvitation,
  getActiveSessions,
  getSessionById,
  addMessageToSession,
  updateSessionProgress,
  endSession,
  cancelInvitation,
  updateCollaborationAvailability,
  getSessionNotifications,
  createTestSession
} from '../controllers/peerLearningController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Peer matching routes
router.get('/matches/:courseId/:chapterId/:levelId', getPeerMatches);

// Invitation routes
router.post('/invitations', sendPeerInvitation);
router.get('/invitations/received', getReceivedInvitations);
router.get('/invitations/sent', getSentInvitations);
router.post('/invitations/:invitationId/respond', respondToInvitation);
router.delete('/invitations/:invitationId', cancelInvitation);

// Session routes
router.get('/sessions/active', getActiveSessions);
router.get('/sessions/:sessionId', getSessionById);
router.post('/sessions/:sessionId/messages', addMessageToSession);
router.put('/sessions/:sessionId/progress', updateSessionProgress);
router.post('/sessions/:sessionId/end', endSession);
router.post('/sessions/test', createTestSession);

// User collaboration availability
router.put('/availability', updateCollaborationAvailability);

// Get session notifications for invitation senders
router.get('/sessions/notifications', getSessionNotifications);

export default router; 