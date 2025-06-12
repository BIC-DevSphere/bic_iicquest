import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import PeerSession from '../models/PeerSession.js';
import PeerInvitation from '../models/PeerInvitation.js';

let io;

// Store active connections by user ID
const activeConnections = new Map();
// Store peer sessions by session ID
const activeSessions = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userId} (${socket.user.fullName}) connected via WebSocket`);
    
    // Store the active connection
    activeConnections.set(socket.userId, socket);

    // Handle joining peer learning room
    socket.on('join-peer-learning', () => {
      socket.join('peer-learning-lobby');
      console.log(`User ${socket.userId} joined peer learning lobby`);
    });

    // Handle joining a specific session
    socket.on('join-session', async (sessionId) => {
      try {
        // Verify session exists in database
        const session = await PeerSession.findOne({ sessionId });
        if (!session) {
          socket.emit('session-join-error', {
            error: 'Session not found',
            sessionId
          });
          return;
        }

        // Check if user is a participant in this session
        const isParticipant = session.participants.some(p => 
          p.user.toString() === socket.userId.toString()
        );
        
        if (!isParticipant) {
          socket.emit('session-join-error', {
            error: 'You are not a participant in this session',
            sessionId
          });
          return;
        }

        // Join the session
        socket.join(sessionId);
        socket.currentSession = sessionId;
        console.log(`🎯 User ${socket.userId} (${socket.user.fullName}) joined session ${sessionId}`);
        
        // Add to active sessions
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(socket.userId);

        // Log current session participants
        console.log(`📊 Session ${sessionId} now has ${activeSessions.get(sessionId).size} participants`);

        // Send confirmation to the user who joined
        socket.emit('session-joined', {
          sessionId,
          participantCount: activeSessions.get(sessionId).size,
          message: 'Successfully joined session',
          timestamp: new Date().toISOString()
        });

        // Notify other participants in the session
        socket.to(sessionId).emit('peer-joined', {
          userId: socket.userId,
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('session-join-error', {
          error: 'Failed to join session',
          sessionId,
          details: error.message
        });
      }
    });

    // Handle invitation acceptance notification
    socket.on('invitation-accepted', async (data) => {
      try {
        const { invitationId, sessionId } = data;
        
        // Find the invitation to get the inviter
        const invitation = await PeerInvitation.findById(invitationId)
          .populate('inviter', 'username fullName');
        
        if (invitation && invitation.inviter) {
          // Notify the invitation sender
          const senderSocket = activeConnections.get(invitation.inviter._id.toString());
          if (senderSocket) {
            console.log(`Notifying invitation sender ${invitation.inviter._id} about acceptance`);
            senderSocket.emit('invitation-accepted-notification', {
              invitation: invitation,
              sessionId: sessionId,
              message: `${socket.user.fullName} accepted your invitation!`,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error handling invitation acceptance:', error);
      }
    });

    // Handle real-time chat messages
    socket.on('send-message', async (data) => {
      const { sessionId, message, type = 'message' } = data;
      
      console.log(`📨 Received message from user ${socket.userId} for session ${sessionId}`);
      console.log(`🔍 User's current session: ${socket.currentSession}`);
      console.log(`🔍 Session match: ${socket.currentSession === sessionId}`);
      
      if (socket.currentSession === sessionId) {
        // Save message to database
        let savedMessage = null;
        try {
          const session = await PeerSession.findOne({ sessionId });
          if (session) {
            session.addMessage(socket.userId, message, type);
            await session.save();
            
            // Get the saved message for consistent data
            savedMessage = session.messages[session.messages.length - 1];
          }
        } catch (error) {
          console.error('Error saving message:', error);
          // Send error back to sender
          socket.emit('message-error', {
            error: 'Failed to save message',
            originalMessage: message
          });
          return;
        }

        // Prepare message data for broadcasting
        const messageData = {
          id: savedMessage?._id || Date.now(),
          sender: {
            _id: socket.userId,
            fullName: socket.user.fullName,
            username: socket.user.username
          },
          text: message,
          type: type,
          timestamp: savedMessage?.timestamp || new Date().toISOString()
        };

        // Broadcast to ALL participants in the session (including sender)
        io.to(sessionId).emit('new-message', messageData);
        
        // Send confirmation to sender
        socket.emit('message-sent', {
          success: true,
          messageId: messageData.id,
          timestamp: messageData.timestamp
        });
        
        console.log(`✅ Message sent in session ${sessionId}: ${message.substring(0, 50)}...`);
      } else {
        // Send error if user is not in the session
        socket.emit('message-error', {
          error: 'You are not in this session',
          originalMessage: message
        });
      }
    });

    // Handle content navigation sync
    socket.on('sync-navigation', (data) => {
      const { sessionId, direction, contentIndex } = data;
      
      if (socket.currentSession === sessionId) {
        // Broadcast navigation change to other participants
        socket.to(sessionId).emit('navigation-synced', {
          direction,
          contentIndex,
          navigatedBy: socket.user.fullName,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle collaborative note updates
    socket.on('update-collaborative-notes', (data) => {
      const { sessionId, notes } = data;
      
      if (socket.currentSession === sessionId) {
        socket.to(sessionId).emit('notes-updated', {
          notes,
          updatedBy: socket.user.fullName,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle code editor updates
    socket.on('code-editor-change', (data) => {
      const { sessionId, code, cursorPosition } = data;
      
      if (socket.currentSession === sessionId) {
        socket.to(sessionId).emit('code-updated', {
          code,
          cursorPosition,
          updatedBy: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle session progress updates
    socket.on('update-session-progress', (data) => {
      const { sessionId, progress } = data;
      
      if (socket.currentSession === sessionId) {
        socket.to(sessionId).emit('progress-updated', {
          progress,
          updatedBy: socket.user.fullName,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle reactions
    socket.on('send-reaction', (data) => {
      const { sessionId, emoji, contentIndex } = data;
      
      if (socket.currentSession === sessionId) {
        socket.to(sessionId).emit('reaction-received', {
          emoji,
          contentIndex,
          sender: socket.user.fullName,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle leaving session
    socket.on('leave-session', (sessionId) => {
      socket.leave(sessionId);
      if (activeSessions.has(sessionId)) {
        activeSessions.get(sessionId).delete(socket.userId);
        if (activeSessions.get(sessionId).size === 0) {
          activeSessions.delete(sessionId);
        }
      }
      
      // Notify other participants
      socket.to(sessionId).emit('peer-left', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date().toISOString()
      });
      
      socket.currentSession = null;
      console.log(`User ${socket.userId} left session ${sessionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Remove from active sessions
      if (socket.currentSession) {
        if (activeSessions.has(socket.currentSession)) {
          activeSessions.get(socket.currentSession).delete(socket.userId);
          if (activeSessions.get(socket.currentSession).size === 0) {
            activeSessions.delete(socket.currentSession);
          }
        }
        
        // Notify other participants
        socket.to(socket.currentSession).emit('peer-disconnected', {
          userId: socket.userId,
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Send initial connection acknowledgment
    socket.emit('connected', {
      message: 'Connected to peer learning WebSocket',
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  return io;
};

// Helper function to emit to specific user
export const emitToUser = (userId, event, data) => {
  const socket = activeConnections.get(userId);
  if (socket) {
    socket.emit(event, data);
    return true;
  }
  return false;
};

// Helper function to emit to session
export const emitToSession = (sessionId, event, data) => {
  if (io) {
    io.to(sessionId).emit(event, data);
    return true;
  }
  return false;
};

// Get active users count
export const getActiveUsersCount = () => {
  return activeConnections.size;
};

// Get active sessions count
export const getActiveSessionsCount = () => {
  return activeSessions.size;
}; 