# IIC Quest Backend API Documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Courses

#### Get All Courses
- **GET** `/api/courses`
- Returns all published courses
- Public access
- Response: Array of course objects

#### Get Course by ID
- **GET** `/api/courses/:id`
- Returns a specific course by ID
- Public access
- Response: Course object

#### Search Courses
- **GET** `/api/courses/search?query=keyword`
- Search courses by title, description, or tags
- Public access
- Response: Array of matching course objects

#### Get Courses by Category
- **GET** `/api/courses/category/:category`
- Returns all courses in a specific category
- Public access
- Response: Array of course objects

#### Get Course Count by Category
- **GET** `/api/courses/category-count`
- Returns the count of courses in each category
- Public access
- Response: Array of category counts

#### Get Courses by Learning Outcome
- **GET** `/api/courses/learning-outcome?outcome=keyword`
- Returns courses matching the learning outcome
- Public access
- Response: Array of course objects

### Users

#### Register User
- **POST** `/api/users/register`
- Register a new user
- Public access
- Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```
- Response: User object with JWT token

#### Login User
- **POST** `/api/users/login`
- Login existing user
- Public access
- Request body:
```json
{
  "email": "string",
  "password": "string"
}
```
- Response: User object with JWT token

#### Get User Profile
- **GET** `/api/users/profile`
- Get current user's profile
- Protected route
- Response: User object

#### Update User Profile
- **PUT** `/api/users/profile`
- Update current user's profile
- Protected route
- Request body: Profile fields to update
- Response: Updated user object

#### Update Password
- **PUT** `/api/users/password`
- Update current user's password
- Protected route
- Request body:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
- Response: Success message

#### Update Learning Goals
- **PUT** `/api/users/learning-goals`
- Update user's learning goals
- Protected route
- Request body:
```json
{
  "currentLearningGoals": [
    {
      "topic": "string",
      "targetDate": "date"
    }
  ]
}
```
- Response: Updated user object

### User Progress

#### Initialize Course Progress
- **POST** `/api/progress/initialize`
- Initialize progress tracking for a course
- Protected route
- Request body:
```json
{
  "courseId": "string"
}
```
- Response: Progress object

#### Get Course Progress
- **GET** `/api/progress/course/:courseId`
- Get user's progress for a specific course
- Protected route
- Response: Progress object

#### Get All Progress
- **GET** `/api/progress/all`
- Get user's progress for all courses
- Protected route
- Response: Array of progress objects

#### Update Test Case Progress
- **PUT** `/api/progress/test-case`
- Update progress for a specific test case
- Protected route
- Request body:
```json
{
  "courseId": "string",
  "chapterIndex": "number",
  "levelIndex": "number",
  "testCaseId": "string",
  "code": "string",
  "passed": "boolean"
}
```
- Response: Updated progress object

#### Update Time Spent
- **PUT** `/api/progress/time-spent`
- Update time spent on a level
- Protected route
- Request body:
```json
{
  "courseId": "string",
  "chapterIndex": "number",
  "levelIndex": "number",
  "timeSpent": "number"
}
```
- Response: Updated progress object

#### Abandon Course
- **PUT** `/api/progress/abandon/:courseId`
- Mark a course as abandoned
- Protected route
- Response: Updated progress object

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
