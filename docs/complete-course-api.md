# Complete Course Creation API Documentation

## Endpoint

```
POST /api/courses/complete
```

## Description

This endpoint allows you to create a complete course with all its chapters, levels, content, and test cases in a single API call. This is particularly useful for bulk course creation or course imports.

## Authentication

- Requires authentication token in the header
- Admin access required

## Request Body Structure

```json
{
  "title": "Course Title",
  "description": "Course Description",
  "category": "Course Category",
  "technologies": [
    {
      "name": "Technology Name"
    }
  ],
  "tags": ["tag1", "tag2"],
  "estimatedHours": 10,
  "learningOutcomes": [
    "Learning Outcome 1",
    "Learning Outcome 2"
  ],
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "isPublished": false,
  "chapters": [
    {
      "title": "Chapter Title",
      "description": "Chapter Description",
      "order": 1,
      "prerequisites": ["Prerequisite 1"],
      "levels": [
        {
          "title": "Level Title",
          "description": "Level Description",
          "order": 1,
          "estimatedTime": 30,
          "starterCode": "// Initial code provided to students",
          "solutionCode": "// Solution code",
          "hints": ["Hint 1", "Hint 2"],
          "content": [
            {
              "title": "Content Section Title",
              "content": {
                "text": "Content text in markdown format",
                "media": "URL to media (optional)",
                "examples": ["Example 1", "Example 2"]
              },
              "order": 1
            }
          ],
          "testCases": [
            {
              "description": "Test Case Description",
              "testCode": "// Test code",
              "expectedOutput": "Expected output",
              "hint": "Hint for failing test"
            }
          ]
        }
      ]
    }
  ]
}
```

## Required Fields

- `title`: Course title
- `description`: Course description
- `category`: Course category
- `chapters`: Array of chapter objects
  - Each chapter must have:
    - `title`: Chapter title
    - `description`: Chapter description
    - `levels`: Array of level objects
      - Each level must have:
        - `title`: Level title
        - `description`: Level description
        - `solutionCode`: Solution code for the level

## Optional Fields

- `technologies`: Array of technology objects
- `tags`: Array of strings
- `estimatedHours`: Number
- `learningOutcomes`: Array of strings
- `requirements`: Array of strings
- `isPublished`: Boolean (defaults to false)
- For chapters:
  - `order`: Number (defaults to array index + 1)
  - `prerequisites`: Array of strings
- For levels:
  - `order`: Number (defaults to array index + 1)
  - `estimatedTime`: Number (defaults to 30 minutes)
  - `starterCode`: String
  - `hints`: Array of strings
  - `content`: Array of content objects
  - `testCases`: Array of test case objects

## Example Request

```json
{
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch",
  "category": "Programming",
  "technologies": [
    {
      "name": "Python"
    }
  ],
  "tags": ["programming", "beginner", "python"],
  "estimatedHours": 8,
  "learningOutcomes": [
    "Understand basic Python syntax",
    "Write simple Python programs",
    "Work with Python data structures"
  ],
  "requirements": [
    "Basic computer knowledge",
    "No prior programming experience needed"
  ],
  "isPublished": false,
  "chapters": [
    {
      "title": "Getting Started with Python",
      "description": "Introduction to Python basics",
      "order": 1,
      "prerequisites": [],
      "levels": [
        {
          "title": "Hello World",
          "description": "Write your first Python program",
          "order": 1,
          "estimatedTime": 15,
          "starterCode": "# Write your code here\n",
          "solutionCode": "print('Hello, World!')",
          "hints": [
            "Use the print() function",
            "Don't forget the quotes around the text"
          ],
          "content": [
            {
              "title": "Introduction",
              "content": {
                "text": "# Your First Python Program\n\nLet's start with the traditional 'Hello, World!' program.\n\nIn Python, we use the `print()` function to output text to the console.",
                "examples": [
                  "print('Hello!')",
                  "print('Welcome to Python')"
                ]
              },
              "order": 1
            }
          ],
          "testCases": [
            {
              "description": "Should output 'Hello, World!'",
              "testCode": "output = capture_output()\nassert output.strip() == 'Hello, World!'",
              "expectedOutput": "Hello, World!",
              "hint": "Make sure you're using print() and the exact text 'Hello, World!'"
            }
          ]
        }
      ]
    }
  ]
}
```

## Success Response

```json
{
  "message": "Course created successfully with all chapters, levels, content, and test cases",
  "course": {
    // Complete course object
  },
  "summary": {
    "totalChapters": 1,
    "totalLevels": 1,
    "totalContent": 1,
    "totalTestCases": 1
  }
}
```

## Error Responses

### Missing Required Fields (400 Bad Request)
```json
{
  "message": "Missing required fields: title, description, category, and chapters array"
}
```

### Invalid Chapter Structure (400 Bad Request)
```json
{
  "message": "Chapter 1: Missing required fields - title, description, and levels array"
}
```

### Invalid Level Structure (400 Bad Request)
```json
{
  "message": "Chapter 1, Level 1: Missing required fields - title, description, and solutionCode"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "message": "Error creating course",
  "error": "Error details"
}
```

## Notes

1. The course will be created in an unpublished state by default (`isPublished: false`)
2. Chapter and level orders are automatically set based on array indices if not provided
3. All content is validated before course creation to ensure required fields are present
4. Media URLs in content sections should be accessible and in a supported format
5. Test cases should be properly formatted and include all required fields 