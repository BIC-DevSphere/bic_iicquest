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

### Course Navigation APIs

#### Get All Chapters
- **GET** `/api/courses/:courseId/chapters`
- Returns all chapters of a course, sorted by order
- Public access
- Response: Array of chapter objects
```json
[
  {
    "title": "string",
    "description": "string",
    "order": "number",
    "prerequisites": ["string"],
    "levels": ["Level"]
  }
]
```

#### Get Chapter Details
- **GET** `/api/courses/:courseId/chapters/:chapterId`
- Returns a specific chapter with its levels
- Public access
- Response: Chapter object with full details

#### Get Chapter Levels
- **GET** `/api/courses/:courseId/chapters/:chapterId/levels`
- Returns all levels in a chapter, sorted by order
- Public access
- Response: Array of level objects
```json
[
  {
    "title": "string",
    "description": "string",
    "order": "number",
    "estimatedTime": "number",
    "starterCode": "string",
    "content": ["Content"],
    "testCases": ["TestCase"]
  }
]
```

#### Get Level Details
- **GET** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId`
- Returns a specific level with its content and test cases
- Public access
- Response: Complete level object

#### Get Level Content
- **GET** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId/content`
- Returns all content items of a level, sorted by order
- Public access
- Response: Array of content objects
```json
[
  {
    "title": "string",
    "content": {
      "text": "string",
      "media": "string",
      "examples": ["string"]
    },
    "order": "number"
  }
]
```

#### Get Level Test Cases
- **GET** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId/test-cases`
- Returns all test cases of a level
- Public access
- Response: Array of test case objects
```json
[
  {
    "description": "string",
    "testCode": "string",
    "expectedOutput": "string",
    "hint": "string"
  }
]
```

#### Get Next Level
- **GET** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId/next`
- Returns the next level in sequence (handles chapter transitions)
- Public access
- Response: Next level and chapter information
```json
{
  "nextLevel": {
    "title": "string",
    "description": "string",
    "order": "number",
    "estimatedTime": "number",
    // ... other level fields
  },
  "nextChapter": {
    "title": "string",
    "description": "string",
    "order": "number",
    // ... other chapter fields
  } | null,
  "courseCompleted": "boolean"
}
```

### Course Creation APIs

#### Create New Course
- **POST** `/api/courses`
- Create a new course
- Request body:
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "estimatedHours": "number",
  "learningOutcomes": ["string"],
  "requirements": ["string"],
  "tags": ["string"]
}
```
- Response: Course object

#### Add Chapter to Course
- **POST** `/api/courses/:courseId/chapters`
- Add a new chapter to a course
- Request body:
```json
{
  "title": "string",
  "description": "string",
  "prerequisites": ["string"],
  "order": "number"
}
```
- Response: Updated course object

#### Add Level to Chapter
- **POST** `/api/courses/:courseId/chapters/:chapterId/levels`
- Add a new level to a chapter
- Request body:
```json
{
  "title": "string",
  "description": "string",
  "order": "number",
  "estimatedTime": "number",
  "starterCode": "string",
  "solutionCode": "string",
  "hints": ["string"]
}
```
- Response: Updated course object

#### Add Content to Level
- **POST** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId/content`
- Add content to a level
- Request body:
```json
{
  "title": "string",
  "content": {
    "text": "string",
    "media": "string",
    "examples": ["string"]
  },
  "order": "number"
}
```
- Response: Updated course object

#### Add Test Case to Level
- **POST** `/api/courses/:courseId/chapters/:chapterId/levels/:levelId/test-cases`
- Add a test case to a level
- Request body:
```json
{
  "description": "string",
  "testCode": "string",
  "expectedOutput": "string",
  "hint": "string"
}
```
- Response: Updated course object

#### Update Course Status
- **PUT** `/api/courses/:courseId/status`
- Update course publish status
- Request body:
```json
{
  "isPublished": "boolean"
}
```
- Response: Updated course object

### Example: Creating a Complete Course

Here's an example flow to create a complete course:

1. Create the course:
```bash
POST /api/courses
{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript from scratch",
  "category": "Programming",
  "estimatedHours": 10,
  "learningOutcomes": ["Understand basic JS syntax", "Write simple programs"],
  "requirements": ["Basic computer knowledge"],
  "tags": ["javascript", "programming", "web development"]
}
```

2. Add a chapter:
```bash
POST /api/courses/{courseId}/chapters
{
  "title": "Variables and Data Types",
  "description": "Learn about JS variables and data types",
  "prerequisites": ["None"],
  "order": 1
}
```

3. Add a level to the chapter:
```bash
POST /api/courses/{courseId}/chapters/{chapterId}/levels
{
  "title": "Introduction to Variables",
  "description": "Learn how to declare and use variables",
  "order": 1,
  "estimatedTime": 30,
  "starterCode": "let myVariable;",
  "solutionCode": "let myVariable = 42;",
  "hints": ["Think about what value you want to store"]
}
```

4. Add content to the level:
```bash
POST /api/courses/{courseId}/chapters/{chapterId}/levels/{levelId}/content
{
  "title": "What are Variables?",
  "content": {
    "text": "Variables are containers for storing data values...",
    "media": "https://example.com/variables.png",
    "examples": ["let x = 5;", "const name = 'John';"]
  },
  "order": 1
}
```

5. Add test cases to the level:
```bash
POST /api/courses/{courseId}/chapters/{chapterId}/levels/{levelId}/test-cases
{
  "description": "Variable should be initialized with number 42",
  "testCode": "assert.equal(myVariable, 42);",
  "expectedOutput": "42",
  "hint": "Use the assignment operator (=) to give the variable a value"
}
```

6. Publish the course:
```bash
PUT /api/courses/{courseId}/status
{
  "isPublished": true
}
```

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

### Projects

#### Get All Projects
- **GET** `/api/projects`
- Returns all projects
- Public access
- Response: Array of project objects
```json
[
  {
    "title": "string",
    "description": "string",
    "technologies": ["string"],
    "roles": [
      {
        "title": "string",
        "description": "string",
        "skills": ["string"],
        "isOpen": "boolean",
        "assignedUser": "User | null"
      }
    ],
    "creator": {
      "username": "string",
      "fullName": "string"
    },
    "isOpenForCollaboration": "boolean",
    "githubRepo": "string",
    "liveDemo": "string",
    "status": "string",
    "collaborators": [
      {
        "user": {
          "username": "string",
          "fullName": "string"
        },
        "role": "string",
        "joinedAt": "date"
      }
    ]
  }
]
```

#### Get Project by ID
- **GET** `/api/projects/:id`
- Returns a specific project by ID
- Public access
- Response: Project object

#### Get Projects by Technology
- **GET** `/api/projects/technology/:technology`
- Returns all projects using a specific technology
- Public access
- Response: Array of project objects

#### Create New Project
- **POST** `/api/projects`
- Create a new project (requires completion of 2 courses)
- Protected route
- Request body:
```json
{
  "title": "string",
  "description": "string",
  "technologies": ["string"],
  "roles": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"]
    }
  ],
  "isOpenForCollaboration": "boolean",
  "githubRepo": "string",
  "liveDemo": "string"
}
```
- Response: Created project object

#### Update Project
- **PUT** `/api/projects/:id`
- Update project details (creator only)
- Protected route
- Request body: Project fields to update
- Response: Updated project object

#### Apply for Role
- **POST** `/api/projects/:id/apply`
- Apply for an open role in a project
- Protected route
- Request body:
```json
{
  "roleId": "string"
}
```
- Response: Updated project object

#### Get User Projects
- **GET** `/api/projects/user/projects`
- Get all projects created by or collaborated on by the user
- Protected route
- Response: Array of project objects

#### Update Project Status
- **PATCH** `/api/projects/:id/status`
- Update project status (creator or collaborator only)
- Protected route
- Request body:
```json
{
  "status": "string" // One of: planning, in_progress, completed, abandoned
}
```
- Response: Updated project object

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
