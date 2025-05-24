# Secure Login API

A robust and secure authentication API built with Node.js, Express, and MySQL using Sequelize ORM.

## Overview

This project provides a secure login system with JWT authentication that can be used as a backend for web and mobile applications. It features user authentication, role-based access control, task management, and secure password handling.

## Features

- **Secure Authentication**: JWT-based authentication system
- **Refresh Tokens**: Secure token refresh mechanism for extended sessions
- **Password Security**: Passwords are hashed using bcrypt
- **Password Management**: Reset, change password functionality
- **Profile Management**: User profile updates
- **Task Management**: CRUD operations for tasks
- **User Administration**: Admin can manage users (activate/deactivate)
- **Email Verification**: Email verification for new accounts
- **Input Validation**: Request validation using express-validator
- **Database Integration**: MySQL database with Sequelize ORM
- **Migration Support**: Database migrations for version control
- **Seeding**: Sample data seeding for development
- **Role-Based Access**: User and admin role support
- **Email Notifications**: Email service for password resets and verification
- **Error Handling**: Comprehensive error handling

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MySQL**: Relational database
- **Sequelize**: ORM for database operations
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing support

## Project Structure

```
├── config/                 # Configuration files
│   ├── config.js           # Sequelize configuration
│   └── database.js         # Database connection setup
├── controllers/            # Request handlers
│   ├── authController.js   # Authentication logic
│   ├── taskController.js   # Task management logic
│   └── userController.js   # User management logic
├── middlewares/            # Express middlewares
│   ├── admin.js            # Admin role verification
│   ├── auth.js             # Authentication verification
│   └── validation.js       # Request validation
├── migrations/             # Database migrations
│   ├── 20250420-create-users-table.js
│   ├── 20250523-create-tasks.js
│   └── 20250523-add-reset-token-to-users.js
├── models/                 # Sequelize models
│   ├── index.js            # Models relationships
│   ├── task.js             # Task model definition
│   └── user.js             # User model definition
├── routes/                 # API routes
│   ├── authRoutes.js       # Authentication routes
│   ├── taskRoutes.js       # Task management routes
│   └── userRoutes.js       # User management routes
├── seeders/                # Database seeders
│   └── 20250420-demo-users.js
├── utils/                  # Utility functions
│   └── emailService.js     # Email sending functionality
├── .env                    # Environment variables (not in repo)
├── .env.example            # Example environment variables
├── .sequelizerc            # Sequelize CLI configuration
├── package.json            # Project dependencies
├── server.js               # Application entry point
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your database credentials and JWT secret

### Database Setup

1. Create the database:
   ```
   npm run db:create
   ```
2. Run migrations:
   ```
   npm run db:migrate
   ```
3. Seed the database with sample data:
   ```
   npm run db:seed
   ```

Alternatively, you can reset the database with a single command:
```
npm run db:reset
```

### Running the Server

Development mode with auto-reload:
```
npm run dev
```

Production mode:
```
npm start
```

The server will start on the port specified in your `.env` file (default: 7000).

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Registers a new user and sends a verification email
  - Request body:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "password": "Password123!"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Registration successful. Please check your email to verify your account.",
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "emailVerified": false
      },
      "token": "your.jwt.token"
    }
    ```

- **GET /api/auth/verify-email/:token**
  - Verifies a user's email address using the token sent via email
  - Response:
    ```json
    {
      "success": true,
      "message": "Email verified successfully"
    }
    ```

- **POST /api/auth/resend-verification-email**
  - Resends the verification email if the user hasn't verified their email yet
  - Request body:
    ```json
    {
      "email": "john.doe@example.com"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "If your email is registered and not verified, you will receive a verification email"
    }
    ```

- **POST /api/auth/login**
  - Authenticates a user and returns access and refresh tokens
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user"
      },
      "accessToken": "your.access.token",
      "refreshToken": "your-refresh-token"
    }
    ```

- **POST /api/auth/refresh-token**
  - Refreshes the access token using a valid refresh token
  - Request body:
    ```json
    {
      "refreshToken": "your-refresh-token"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "accessToken": "your.new.access.token"
    }
    ```

- **POST /api/auth/logout**
  - Revokes a refresh token (logs out from current device)
  - Request body:
    ```json
    {
      "refreshToken": "your-refresh-token"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```

- **POST /api/auth/logout-all** (requires authentication)
  - Revokes all refresh tokens for the user (logs out from all devices)
  - Response:
    ```json
    {
      "success": true,
      "message": "Logged out from all devices successfully"
    }
    ```

- **POST /api/auth/request-password-reset**
  - Requests a password reset link sent to user's email
  - Request body:
    ```json
    {
      "email": "user@example.com"
    }
    ```

- **POST /api/auth/reset-password**
  - Resets user's password using token received via email
  - Request body:
    ```json
    {
      "token": "reset_token_from_email",
      "newPassword": "new_password"
    }
    ```

- **POST /api/auth/change-password** (requires authentication)
  - Changes user's password
  - Request body:
    ```json
    {
      "currentPassword": "current_password",
      "newPassword": "new_password"
    }
    ```

- **PUT /api/auth/profile** (requires authentication)
  - Updates user's profile information
  - Request body:
    ```json
    {
      "firstName": "New First Name",
      "lastName": "New Last Name"
    }
    ```

### Tasks

- **GET /api/tasks** (requires authentication)
  - Gets all tasks for the authenticated user (admins can see all tasks)
  - Optional query parameters: `status`, `priority`, `search`

- **GET /api/tasks/:id** (requires authentication)
  - Gets a specific task by ID

- **POST /api/tasks** (requires authentication)
  - Creates a new task
  - Request body:
    ```json
    {
      "title": "Task Title",
      "description": "Task Description",
      "status": "pending",
      "dueDate": "2025-06-01T00:00:00.000Z",
      "priority": "medium",
      "userId": 1 // Optional, admin only
    }
    ```

- **PUT /api/tasks/:id** (requires authentication)
  - Updates an existing task
  - Request body: Same as POST but all fields are optional

- **DELETE /api/tasks/:id** (requires authentication)
  - Deletes a task

### User Management (Admin Only)

- **GET /api/users** (requires admin)
  - Gets all users

- **GET /api/users/:id** (requires admin or self)
  - Gets a specific user by ID

- **POST /api/users** (requires admin)
  - Creates a new user
  - Request body:
    ```json
    {
      "firstName": "New",
      "lastName": "User",
      "email": "new.user@example.com",
      "password": "password",
      "role": "user" // Optional, defaults to 'user'
    }
    ```

- **PUT /api/users/:id** (requires admin or self)
  - Updates a user
  - Request body: Same as POST but all fields are optional
  - Note: Only admins can change email, role, and active status

- **PATCH /api/users/:id/toggle-status** (requires admin)
  - Activates or deactivates a user account

## Default Users

The seeder creates two default users:

1. Regular User
   - Email: john.doe@example.com
   - Password: password123
   - Role: user

2. Admin User
   - Email: admin@example.com
   - Password: adminpass
   - Role: admin

## Environment Variables

Create a `.env` file with the following variables:

```
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=secure_login_db
DB_PORT=3306

# Server Configuration
PORT=7000
NODE_ENV=development

# JWT Secret (for token generation)
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=API Service

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

## License

ISC

## Future Enhancements

- Two-factor authentication
- OAuth integration (Google, Facebook, etc.)
- API rate limiting
- Enhanced logging and monitoring
- File upload functionality
- Advanced search and filtering for tasks
- Task notifications and reminders
