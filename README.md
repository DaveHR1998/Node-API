# Secure Login API

A robust and secure authentication API built with Node.js, Express, and MySQL using Sequelize ORM.

## Overview

This project provides a secure login system with JWT authentication that can be used as a backend for web and mobile applications. It features user authentication, role-based access control, and secure password handling.

## Features

- **Secure Authentication**: JWT-based authentication system
- **Password Security**: Passwords are hashed using bcrypt
- **Input Validation**: Request validation using express-validator
- **Database Integration**: MySQL database with Sequelize ORM
- **Migration Support**: Database migrations for version control
- **Seeding**: Sample data seeding for development
- **Role-Based Access**: User and admin role support
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
│   └── authController.js   # Authentication logic
├── middlewares/            # Express middlewares
│   └── validation.js       # Request validation
├── migrations/             # Database migrations
│   └── 20250420-create-users-table.js
├── models/                 # Sequelize models
│   └── user.js             # User model definition
├── routes/                 # API routes
│   └── authRoutes.js       # Authentication routes
├── seeders/                # Database seeders
│   └── 20250420-demo-users.js
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

- **POST /api/auth/login**
  - Authenticates a user and returns a JWT token
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
      "token": "your.jwt.token"
    }
    ```

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
```

## License

ISC

## Future Enhancements

- User registration endpoint
- Password reset functionality
- Email verification
- Refresh token implementation
- Additional user management endpoints
- Enhanced security features
