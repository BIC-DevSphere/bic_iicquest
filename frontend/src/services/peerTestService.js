import axiosInstance from "@/configs/axiosConfig";
import { getSessionById } from "./peerLearningService";
import socketService from "./socketService";
import toast from 'react-hot-toast';

const API_ENDPOINTS = {
  createPeerTestSession: '/peer-learning/sessions/test',
  joinPeerTest: (sessionId) => `/peer-learning/sessions/${sessionId}/join-test`,
  submitTestResults: (sessionId) => `/peer-learning/sessions/${sessionId}/test-results`,
  syncTestProgress: (sessionId) => `/peer-learning/sessions/${sessionId}/sync-progress`
};

export class PeerTestService {
  constructor() {
    this.currentSession = null;
    this.isConnected = false;
    this.testListeners = new Map();
  }

  // Create a new peer test session
  async createPeerTestSession(courseId, chapterId, levelId, inviteUserId) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.createPeerTestSession, {
        courseId,
        chapterId,
        levelId,
        sessionType: 'collaborative_test',
        inviteUserId
      });
      
      return response.data.session;
    } catch (error) {
      console.error('Error creating peer test session:', error);
      throw error;
    }
  }

  // Join an existing peer test session
  async joinPeerTestSession(sessionId) {
    try {
      // Get session data
      const response = await getSessionById(sessionId);
      const session = response.session;
      
      // Connect to WebSocket if not connected
      const token = localStorage.getItem('authToken');
      if (token && !socketService.isSocketConnected()) {
        await socketService.connect(token);
      }
      
      // Join the session
      await socketService.joinSession(sessionId);
      
      this.currentSession = session;
      this.isConnected = true;
      
      // Setup test-specific listeners
      this.setupTestListeners(sessionId);
      
      return session;
    } catch (error) {
      console.error('Error joining peer test session:', error);
      throw error;
    }
  }

  // Setup WebSocket listeners for test-specific events
  setupTestListeners(sessionId) {
    // Listen for peer code updates
    socketService.onCodeUpdate((data) => {
      if (this.testListeners.has('code-update')) {
        this.testListeners.get('code-update')(data);
      }
    });

    // Listen for test result sharing
    socketService.onMessage((message) => {
      if (message.type === 'test_result' || message.type === 'test_completion') {
        if (this.testListeners.has('test-update')) {
          this.testListeners.get('test-update')(message);
        }
      }
    });

    // Listen for peer session events
    socketService.onPeerJoined((data) => {
      if (this.testListeners.has('peer-joined')) {
        this.testListeners.get('peer-joined')(data);
      }
      toast.success(`${data.user.fullName} joined the test session!`);
    });

    socketService.onPeerLeft((data) => {
      if (this.testListeners.has('peer-left')) {
        this.testListeners.get('peer-left')(data);
      }
      toast.error(`${data.user.fullName} left the test session`);
    });
  }

  // Send code update to peer
  syncCode(code, cursorPosition = null) {
    if (this.isConnected && this.currentSession) {
      socketService.sendCodeUpdate({
        sessionId: this.currentSession.sessionId,
        code,
        cursorPosition
      });
    }
  }

  // Send test result to peer
  shareTestResult(testIndex, result) {
    if (this.isConnected && this.currentSession) {
      socketService.sendMessage({
        sessionId: this.currentSession.sessionId,
        message: `Test ${testIndex + 1}: ${result.passed ? 'PASSED ✅' : 'FAILED ❌'}`,
        type: 'test_result'
      });
    }
  }

  // Send test completion notification
  shareTestCompletion(completionData) {
    if (this.isConnected && this.currentSession) {
      socketService.sendMessage({
        sessionId: this.currentSession.sessionId,
        message: JSON.stringify({
          action: 'test_completed',
          completionTime: completionData.completionTime,
          score: completionData.score,
          timestamp: Date.now()
        }),
        type: 'test_completion'
      });
    }
  }

  // Send individual test progress
  shareTestProgress(testIndex, result, completionTime) {
    if (this.isConnected && this.currentSession) {
      socketService.sendMessage({
        sessionId: this.currentSession.sessionId,
        message: JSON.stringify({
          action: 'test_progress',
          testIndex,
          passed: result.passed,
          completionTime,
          timestamp: Date.now()
        }),
        type: 'test_progress'
      });
    }
  }

  // Start competition countdown
  startCompetition() {
    if (this.isConnected && this.currentSession) {
      socketService.sendMessage({
        sessionId: this.currentSession.sessionId,
        message: JSON.stringify({
          action: 'start_competition',
          timestamp: Date.now()
        }),
        type: 'competition_start'
      });
    }
  }

  // Register event listeners
  on(event, callback) {
    this.testListeners.set(event, callback);
  }

  // Remove event listeners
  off(event) {
    this.testListeners.delete(event);
  }

  // Send a message to the session
  sendMessage(text, type = 'message') {
    if (this.isConnected && this.currentSession) {
      socketService.sendMessage({
        sessionId: this.currentSession.sessionId,
        message: text,
        type
      });
    }
  }

  // Leave the test session
  leaveSession() {
    if (this.isConnected && this.currentSession) {
      socketService.leaveSession(this.currentSession.sessionId);
      this.currentSession = null;
      this.isConnected = false;
      this.testListeners.clear();
    }
  }

  // Get current session info
  getCurrentSession() {
    return this.currentSession;
  }

  // Check if connected to a test session
  isConnectedToTestSession() {
    return this.isConnected && this.currentSession?.sessionType === 'collaborative_test';
  }
}

// Create singleton instance
const peerTestService = new PeerTestService();
export default peerTestService; 