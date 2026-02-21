## Overview

This is the backend API for the equipment management system, built with Node.js, Express, and MongoDB. It provides authentication, equipment management, and request handling functionalities.

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- MongoDB database (local or cloud instance like MongoDB Atlas)

### Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend root directory with the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- `/api/auth` - Authentication routes (login, register)
- `/api/equipment` - Equipment management
- `/api/requests` - Request handling
- `/api/health` - Health check

## Design Decisions

### Technology Stack

- **Express.js**: Chosen for its simplicity and extensive middleware ecosystem for building REST APIs.
- **MongoDB with Mongoose**: NoSQL database for flexible schema design, suitable for equipment and user data that may evolve.
- **JWT Authentication**: Stateless authentication using JSON Web Tokens for secure API access.
- **bcryptjs**: For password hashing to ensure security.
- **CORS**: Enabled to allow cross-origin requests from the frontend.
- **Morgan**: HTTP request logger for development debugging.
- **ES Modules**: Used instead of CommonJS for modern JavaScript support.

### Architecture

- **MVC Pattern**: Separated into models, views (routes), and controllers for maintainability.
- **Middleware**: Custom middleware for authentication, error handling, and role-based access.
- **Error Handling**: Centralized error handling with custom middleware.
- **Environment Configuration**: Sensitive data stored in environment variables.

### Security

- Passwords are hashed before storage.
- JWT tokens are used for session management.
- CORS is configured to restrict origins in production.
