import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userProgressRoutes from './routes/userProgressRoutes.js';
import communityPostRoutes from './routes/communityPostRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import peerLearningRoutes from './routes/peerLearningRoutes.js';
import { initializeSocket } from './sockets/peerLearningSocket.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket
const io = initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/post', communityPostRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/peer-learning', peerLearningRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`WebSocket server initialized`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
