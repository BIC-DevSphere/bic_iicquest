import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventHandlers = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    const authToken = token || localStorage.getItem('token') || localStorage.getItem('authToken');

    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        auth: {
          token: authToken
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Connection successful
      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      // Initial connection acknowledgment
      this.socket.on('connected', (data) => {
        console.log('WebSocket connection acknowledged:', data);
      });

      // Connection failed
      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection failed:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to WebSocket server'));
        }
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        this.isConnected = false;
      });

      // Reconnection
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      // Authentication error
      this.socket.on('connect_error', (error) => {
        if (error.message === 'Authentication error') {
          console.error('🚫 WebSocket authentication failed');
          reject(new Error('Authentication failed'));
        }
      });
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  // Join peer learning lobby
  joinPeerLearning() {
    if (this.isConnected) {
      this.socket.emit('join-peer-learning');
    }
  }

  // Join a specific peer session
  joinSession(sessionId) {
    return new Promise((resolve, reject) => {
      if (this.isConnected && sessionId) {
        console.log(`🎯 Joining session: ${sessionId}`);
        
        // Set up one-time listener for join confirmation
        const timeout = setTimeout(() => {
          this.socket.off('session-joined');
          reject(new Error('Session join timeout'));
        }, 5000);
        
        this.socket.once('session-joined', (data) => {
          clearTimeout(timeout);
          console.log(`✅ Successfully joined session: ${sessionId}`);
          resolve(data);
        });
        
        this.socket.emit('join-session', sessionId);
      } else {
        reject(new Error('Not connected or no session ID'));
      }
    });
  }

  // Leave a session
  leaveSession(sessionId) {
    if (this.isConnected && sessionId) {
      console.log(`👋 Leaving session: ${sessionId}`);
      this.socket.emit('leave-session', sessionId);
    }
  }

  // Notify when invitation is accepted
  notifyInvitationAccepted(invitationId, sessionId) {
    if (this.isConnected) {
      console.log(`📨 Notifying invitation acceptance: ${invitationId}`);
      this.socket.emit('invitation-accepted', {
        invitationId,
        sessionId
      });
    }
  }

  // Send chat message
  sendMessage(sessionId, message, type = 'message') {
    if (this.isConnected && sessionId) {
      this.socket.emit('send-message', {
        sessionId,
        message,
        type
      });
    }
  }

  // Sync content navigation
  syncNavigation(sessionId, direction, contentIndex) {
    if (this.isConnected && sessionId) {
      this.socket.emit('sync-navigation', {
        sessionId,
        direction,
        contentIndex
      });
    }
  }

  // Update collaborative notes
  updateCollaborativeNotes(sessionId, notes) {
    if (this.isConnected && sessionId) {
      this.socket.emit('update-collaborative-notes', {
        sessionId,
        notes
      });
    }
  }

  // Update code editor
  updateCodeEditor(sessionId, code, cursorPosition) {
    if (this.isConnected && sessionId) {
      this.socket.emit('code-editor-change', {
        sessionId,
        code,
        cursorPosition
      });
    }
  }

  // Send reaction
  sendReaction(sessionId, emoji, contentIndex) {
    if (this.isConnected && sessionId) {
      this.socket.emit('send-reaction', {
        sessionId,
        emoji,
        contentIndex
      });
    }
  }

  // Update session progress
  updateSessionProgress(sessionId, progress) {
    if (this.isConnected && sessionId) {
      this.socket.emit('update-session-progress', {
        sessionId,
        progress
      });
    }
  }

  // Event listeners
  onInvitationAccepted(callback) {
    if (this.socket) {
      this.socket.on('invitation-accepted-notification', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message-error', callback);
    }
  }

  onNavigationSynced(callback) {
    if (this.socket) {
      this.socket.on('navigation-synced', callback);
    }
  }

  onNotesUpdated(callback) {
    if (this.socket) {
      this.socket.on('notes-updated', callback);
    }
  }

  onCodeUpdated(callback) {
    if (this.socket) {
      this.socket.on('code-updated', callback);
    }
  }

  onProgressUpdated(callback) {
    if (this.socket) {
      this.socket.on('progress-updated', callback);
    }
  }

  onReactionReceived(callback) {
    if (this.socket) {
      this.socket.on('reaction-received', callback);
    }
  }

  onPeerJoined(callback) {
    if (this.socket) {
      this.socket.on('peer-joined', callback);
    }
  }

  onPeerLeft(callback) {
    if (this.socket) {
      this.socket.on('peer-left', callback);
    }
  }

  onPeerDisconnected(callback) {
    if (this.socket) {
      this.socket.on('peer-disconnected', callback);
    }
  }

  onSessionJoinError(callback) {
    if (this.socket) {
      this.socket.on('session-join-error', callback);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific event listener
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 