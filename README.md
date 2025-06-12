# UpTogether

A comprehensive full-stack learning platform designed to provide interactive coding education with peer collaboration features, real-time communication, and project-based learning.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [WebSocket Events](#websocket-events)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Overview

UpTogether is a modern learning platform that combines traditional course-based learning with collaborative features. The platform enables users to learn programming through structured courses, participate in peer learning sessions, collaborate on projects, and engage with a community of learners.

### Key Capabilities

- **Interactive Learning**: Structured courses with chapters, levels, and hands-on coding exercises
- **Peer Collaboration**: Real-time peer learning sessions with WebSocket communication
- **Project Management**: Collaborative project creation and management system
- **Community Features**: Discussion forums and community posts
- **Progress Tracking**: Comprehensive user progress monitoring and analytics
- **Skill Assessment**: Integrated testing system with automated evaluation

## Features

### Learning Management
- Structured course catalog with categorized content
- Multi-level chapter organization with progressive difficulty
- Interactive coding exercises with test cases
- Real-time code execution and validation
- Progress tracking and completion certificates
- Skill-based learning paths

### Collaboration Tools
- Real-time peer learning sessions
- Project collaboration workspace
- Group chat functionality
- Peer invitation system
- Shared coding environment

### User Management
- Secure authentication with JWT tokens
- Comprehensive user profiles with skills and badges
- Learning goal tracking
- Achievement system
- Profile customization with image upload

### Community Features
- Discussion forums
- Community posts and interactions
- Job board integration
- Peer networking capabilities

## Technology Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time Communication**: Socket.IO
- **File Upload**: Multer with Cloudinary integration
- **AI Integration**: Google Generative AI
- **Security**: bcryptjs for password hashing, CORS middleware

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Code Editor**: Monaco Editor
- **State Management**: React hooks and context
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion

### Development Tools
- **Development Server**: Nodemon
- **Code Formatting**: Prettier

## Project Structure

```
bic_iicquest/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── askGeminiController.js
│   │   │   ├── communityPostController.js
│   │   │   ├── courseController.js
│   │   │   ├── peerLearningController.js
│   │   │   ├── projectController.js
│   │   │   ├── userController.js
│   │   │   └── userProgressController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── communityPost.js
│   │   │   ├── Course.js
│   │   │   ├── GroupChat.js
│   │   │   ├── PeerInvitation.js
│   │   │   ├── PeerSession.js
│   │   │   ├── Project.js
│   │   │   ├── User.js
│   │   │   └── UserProgress.js
│   │   ├── routes/
│   │   │   ├── communityPostRoutes.js
│   │   │   ├── courseRoutes.js
│   │   │   ├── peerLearningRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── userProgressRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── sockets/
│   │   │   └── peerLearningSocket.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── configs/
│   │   ├── data/
│   │   ├── Layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **MongoDB** (version 5.0 or higher)
- **Git** (for version control)

### Optional Requirements
- **MongoDB Compass** (for database visualization)
- **Postman** (for API testing)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bic_iicquest
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/iicquest

# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Environment
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend server will start on `http://localhost:3000`

2. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173`

### Production Mode

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Backend in Production**:
   ```bash
   cd backend
   npm start
   ```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | User registration |
| POST | `/api/users/login` | User authentication |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Course Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get specific course |
| POST | `/api/courses` | Create new course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Progress Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user-progress/:userId` | Get user progress |
| POST | `/api/user-progress` | Update progress |
| GET | `/api/user-progress/:userId/course/:courseId` | Get course-specific progress |

### Peer Learning

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/peer-learning/sessions` | Create peer session |
| GET | `/api/peer-learning/sessions` | Get available sessions |
| POST | `/api/peer-learning/invitations` | Send peer invitation |
| PUT | `/api/peer-learning/invitations/:id` | Respond to invitation |

### Project Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get specific project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Community Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/post` | Get community posts |
| POST | `/api/post` | Create new post |
| PUT | `/api/post/:id` | Update post |
| DELETE | `/api/post/:id` | Delete post |

## License

This project is licensed under the ISC License. See the LICENSE file for details.

---

