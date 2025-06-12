import axiosInstance from "@/configs/axiosConfig";

const API_ENDPOINTS = {
  getPeerMatches: (courseId, chapterId, levelId) => `/peer-learning/matches/${courseId}/${chapterId}/${levelId}`,
  sendInvitation: '/peer-learning/invitations',
  getReceivedInvitations: '/peer-learning/invitations/received',
  getSentInvitations: '/peer-learning/invitations/sent',
  respondToInvitation: (invitationId) => `/peer-learning/invitations/${invitationId}/respond`,
  cancelInvitation: (invitationId) => `/peer-learning/invitations/${invitationId}`,
  getActiveSessions: '/peer-learning/sessions/active',
  getSessionById: (sessionId) => `/peer-learning/sessions/${sessionId}`,
  addMessageToSession: (sessionId) => `/peer-learning/sessions/${sessionId}/messages`,
  updateSessionProgress: (sessionId) => `/peer-learning/sessions/${sessionId}/progress`,
  endSession: (sessionId) => `/peer-learning/sessions/${sessionId}/end`,
  updateAvailability: '/peer-learning/availability'
};

// Get potential peer matches for a specific course/chapter/level
export const getPeerMatches = async (courseId, chapterId, levelId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getPeerMatches(courseId, chapterId, levelId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send peer learning invitation
export const sendPeerInvitation = async (invitationData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.sendInvitation, invitationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get received invitations
export const getReceivedInvitations = async (status = 'pending') => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getReceivedInvitations, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get sent invitations
export const getSentInvitations = async (status = 'pending') => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getSentInvitations, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Respond to invitation (accept/decline)
export const respondToInvitation = async (invitationId, action) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.respondToInvitation(invitationId), {
      action
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel invitation
export const cancelInvitation = async (invitationId) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.cancelInvitation(invitationId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get active peer sessions
export const getActiveSessions = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getActiveSessions);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get session by ID
export const getSessionById = async (sessionId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getSessionById(sessionId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add message to session
export const addMessageToSession = async (sessionId, messageData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.addMessageToSession(sessionId), messageData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update session progress
export const updateSessionProgress = async (sessionId, progressData) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.updateSessionProgress(sessionId), progressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// End session
export const endSession = async (sessionId) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.endSession(sessionId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update collaboration availability
export const updateCollaborationAvailability = async (isAvailable) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.updateAvailability, {
      isAvailable
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check for invitation status updates (for senders)
export const checkInvitationUpdates = async () => {
  const response = await axiosInstance.get('/peer-learning/invitations/sent?status=accepted');
  return response.data;
};

// Get notification for session start (for invitation senders)
export const checkForSessionNotifications = async () => {
  const response = await axiosInstance.get('/peer-learning/sessions/notifications');
  return response.data;
}; 