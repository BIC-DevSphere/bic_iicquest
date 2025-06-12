# Peer Learning System Setup Guide

## Overview

This guide walks you through setting up the complete peer learning system with real-time collaboration features.

## Prerequisites

### Backend Requirements
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Frontend Requirements
- React 18+
- Vite build tool
- Modern browser with WebSocket support

## Installation Steps

### 1. Backend Setup

**Install Dependencies:**
```bash
cd backend
npm install
```

**Environment Configuration:**
Create `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/iic-quest
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=development
```

**Database Indexes (Optional but Recommended):**
Connect to MongoDB and create these indexes for optimal performance:
```javascript
// In MongoDB shell or MongoDB Compass
use iic-quest

// Peer invitation indexes
db.peerinvitations.createIndex({ "invitee": 1, "status": 1, "createdAt": -1 })
db.peerinvitations.createIndex({ "inviter": 1, "status": 1, "createdAt": -1 })
db.peerinvitations.createIndex({ "course": 1, "status": 1 })
db.peerinvitations.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Peer session indexes
db.peersessions.createIndex({ "sessionId": 1 }, { unique: true })
db.peersessions.createIndex({ "participants.user": 1, "status": 1 })
db.peersessions.createIndex({ "course": 1, "status": 1 })

// User availability index
db.users.createIndex({ "isAvailableForCollaboration": 1 })
```

**Start Backend Server:**
```bash
npm start
```

### 2. Frontend Setup

**Install Dependencies:**
```bash
cd frontend
npm install
```

**Environment Configuration:**
Create `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_PEER_LEARNING=true
```

**Start Development Server:**
```bash
npm run dev
```

### 3. Verify Installation

**Check Backend:**
- Visit `http://localhost:5000/api/peer-learning/availability` (should return 401 unauthorized, indicating the route is working)

**Check Frontend:**
- Visit `http://localhost:3000` (or your configured port)
- Look for the bell icon (🔔) in the sidebar for peer learning notifications

## Features Verification

### 1. Peer Matching
1. Register/login as two different users
2. Have both users start the same course and reach similar progress levels
3. Select "Peer Learning" mode from course overview
4. Verify intelligent peer matching shows compatible users

### 2. Invitation System
1. Send a peer learning invitation from one user to another
2. Check notification bell in sidebar shows pending invitation count
3. Accept/decline invitations and verify session creation

### 3. Collaborative Session
1. Accept a peer learning invitation
2. Verify real-time collaboration workspace appears
3. Test chat, collaborative notes, and shared code editor
4. Verify synchronized content navigation

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongoServerError: connect ECONNREFUSED ::1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

**2. JWT Authentication Error**
```
Error: jwt must be provided
```
**Solution:** Ensure you're logged in and the JWT token is stored in localStorage.

**3. CORS Error**
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```
**Solution:** Verify the backend CORS configuration includes your frontend URL:
```javascript
// In backend/src/index.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true
}));
```

**4. Peer Matching Returns Empty Results**
**Solution:** 
- Ensure multiple users are registered
- Users should have similar course progress
- Check that users have `isAvailableForCollaboration: true`

### Database Issues

**Reset Peer Learning Data:**
```javascript
// In MongoDB shell
use iic-quest
db.peerinvitations.deleteMany({})
db.peersessions.deleteMany({})
db.users.updateMany({}, { $set: { isAvailableForCollaboration: true } })
```

**Check User Compatibility Data:**
```javascript
// Verify user has earned technologies
db.users.findOne({ email: "user@example.com" }, { earnedTechnologies: 1, isAvailableForCollaboration: 1 })

// Check course technologies
db.courses.findOne({ _id: ObjectId("courseId") }, { technologies: 1 })
```

## Development Tips

### 1. Testing Peer Matching
Create test users with similar profiles:
```javascript
// Create compatible test users
const testUsers = [
  {
    username: "alice_dev",
    email: "alice@test.com",
    fullName: "Alice Developer",
    earnedTechnologies: [
      { name: "JavaScript" },
      { name: "React" },
      { name: "Node.js" }
    ],
    isAvailableForCollaboration: true
  },
  {
    username: "bob_dev", 
    email: "bob@test.com",
    fullName: "Bob Developer",
    earnedTechnologies: [
      { name: "JavaScript" },
      { name: "React" },
      { name: "Python" }
    ],
    isAvailableForCollaboration: true
  }
];
```

### 2. Simulating Real-time Features
Since WebSocket isn't fully implemented, test with simulated delays:
```javascript
// Simulate real-time message delivery
setTimeout(() => {
  // Add peer response to messages
}, 1000 + Math.random() * 2000);
```

### 3. Debugging Session Issues
Enable debug logging:
```javascript
// In frontend services
console.log('Peer session data:', sessionData);
console.log('Current user ID:', getCurrentUserId());
console.log('Peer participant:', peerParticipant);
```

## Production Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB Atlas or production database
3. Enable HTTPS and secure JWT secrets
4. Set up WebSocket support (Socket.io)
5. Configure rate limiting for API endpoints

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Configure production API URLs
3. Enable service worker for offline support
4. Set up CDN for static assets

### WebSocket Integration (Future)
For full real-time features, integrate Socket.io:

**Backend:**
```javascript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL }
});

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
  });
  
  socket.on('session-message', (data) => {
    socket.to(data.sessionId).emit('new-message', data);
  });
});
```

**Frontend:**
```javascript
import io from 'socket.io-client';

const socket = io(process.env.VITE_API_BASE_URL);

socket.emit('join-session', sessionId);
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

## Performance Monitoring

### Key Metrics to Monitor
- Peer matching response time
- Session creation latency
- Message delivery time
- Database query performance
- User engagement in collaborative sessions

### Recommended Tools
- MongoDB Compass for database monitoring
- React DevTools for frontend debugging
- Network tab for API call analysis
- MongoDB Profiler for slow query detection

## Support and Extensions

### Adding New Session Types
1. Update `sessionType` enum in PeerSession model
2. Add new session type handling in controllers
3. Create frontend UI for new session type
4. Update invitation flow to support new type

### Custom Matching Algorithms
Modify the compatibility scoring in `getPeerMatches`:
```javascript
// Add custom factors
const customFactor = calculateCustomCompatibility(user, peer);
compatibilityScore += customFactor * weight;
```

### Integration with External Tools
- Video conferencing: Integrate with Zoom, Meet, or Jitsi APIs
- Screen sharing: Use WebRTC or third-party services
- File sharing: Add support for document collaboration

This setup guide provides everything needed to get the peer learning system running in development and production environments. 