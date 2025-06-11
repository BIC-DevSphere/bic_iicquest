# Node.js Backend

A modern Node.js backend application with Express.js.

## Features

- Express.js web framework
- Environment configuration
- Security middleware (helmet, cors)
- Logging (morgan)
- Error handling
- Development hot-reload

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables:
   ```
   NODE_ENV=development
   PORT=3000
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
.
├── src/              # Source files
│   └── index.js      # Application entry point
├── config/           # Configuration files
│   └── config.js     # Environment configuration
├── .env             # Environment variables
├── .gitignore       # Git ignore file
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation
```

## Scripts

- `npm start`: Run the application in production mode
- `npm run dev`: Run the application in development mode with hot-reload
- `npm test`: Run tests

## License

ISC 