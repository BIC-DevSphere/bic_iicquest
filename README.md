# IIC Quest - Interactive Learning Platform

IIC Quest is a comprehensive interactive learning platform designed to provide structured programming courses, collaborative project development, and community engagement for learners at all levels.

## 🌟 Features

### 📚 Learning Management System
- **Interactive Courses**: Structured courses with chapters, levels, and hands-on coding exercises
- **Progress Tracking**: Real-time progress monitoring with completion percentages and time tracking
- **Learning Outcomes**: Clear learning objectives and skill acquisition tracking
- **Test Cases**: Automated code testing and validation for programming exercises
- **Adaptive Learning**: Personalized learning paths based on user progress and goals

### 🤝 Collaborative Learning
- **Pair Programming**: Real-time collaborative coding sessions with peers
- **Project Collaboration**: Team-based project development with role assignments
- **Skill Matching**: Smart matching system for finding compatible learning partners
- **Group Chats**: Integrated communication for project teams

### 🚀 Project Management
- **Project Creation**: Create and manage collaborative projects with defined roles
- **Role-based Applications**: Apply for specific roles in projects based on skills
- **Technology Matching**: Find projects based on preferred technologies
- **Progress Monitoring**: Track project objectives and weekly goals
- **Team Management**: Manage collaborators and their contributions

### 👥 Community Features
- **Community Posts**: Share knowledge, ask questions, and engage with fellow learners
- **User Profiles**: Showcase skills, achievements, and learning progress
- **Badges & Achievements**: Gamified learning experience with rewards
- **Learning Goals**: Set and track personal learning objectives

### 💼 Career Development
- **Job Board**: Browse and apply for relevant job opportunities
- **Skills Validation**: Demonstrate proficiency through completed projects and courses
- **Portfolio Building**: Showcase completed projects and acquired skills

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Comprehensive API endpoints for all platform features
- **MongoDB Database**: Flexible document-based data storage
- **JWT Authentication**: Secure user authentication and authorization
- **File Upload**: Support for profile pictures and project assets
- **Real-time Features**: Socket.io integration for collaborative features

### Frontend (React + Vite)
- **Modern React**: Built with React 19 and modern hooks
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Component Library**: Radix UI components for consistent UX
- **State Management**: Context API and local state management
- **Routing**: React Router for seamless navigation
- **Animation**: Framer Motion for smooth user interactions

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary integration
- **Password Hashing**: bcryptjs
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Animation**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bic_iicquest/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
bic_iicquest/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Authentication & validation
│   │   ├── config/         # Database configuration
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── configs/       # Configuration files
│   │   ├── Layouts/       # Layout components
│   │   ├── lib/          # Utility functions
│   │   └── data/         # Static data
│   ├── package.json
│   └── README.md
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/search` - Search courses
- `GET /api/courses/:courseId/chapters` - Get course chapters
- `GET /api/courses/:courseId/chapters/:chapterId/levels` - Get chapter levels

### Progress Tracking
- `POST /api/user-progress/initialize` - Initialize course progress
- `GET /api/user-progress/course/:courseId` - Get course progress
- `PUT /api/user-progress/level` - Update level progress
- `PUT /api/user-progress/complete-test` - Complete level test

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/apply` - Apply for project role

### Community
- `GET /api/post` - Get community posts
- `POST /api/post` - Create new post
- `POST /api/post/comment/:id` - Comment on post

## 🎯 Key Features Implementation

### Course Management
The platform supports hierarchical course structure:
- **Courses** contain multiple chapters
- **Chapters** contain multiple levels
- **Levels** contain content and test cases
- Progress is tracked at each level with completion status

### Project Collaboration
Projects include:
- Role-based team structure
- Technology requirements
- Application system for joining projects
- Objective and goal tracking
- Group chat integration

### User Progress System
Comprehensive tracking includes:
- Course completion percentages
- Time spent on each level
- Learning streaks and achievements
- Skill progression and technology mastery

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables for production
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder to your preferred hosting (Netlify, Vercel, etc.)
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**IIC Quest** - Empowering learners through interactive education and collaborative development.
