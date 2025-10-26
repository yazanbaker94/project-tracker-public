# Project Tracker Backend API

A robust, scalable backend API built with Express.js, TypeScript, and PostgreSQL for the Project Tracker application.

## 🚀 Features

- **JWT Authentication** - Secure user authentication and authorization
- **RESTful API** - Clean, consistent API endpoints
- **PostgreSQL Database** - Reliable data persistence with proper relationships
- **TypeScript** - Type-safe development with excellent IDE support
- **Input Validation** - Comprehensive request validation and sanitization
- **Error Handling** - Structured error responses with proper HTTP status codes
- **Security** - Helmet.js security headers, CORS configuration
- **Logging** - Morgan HTTP request logging

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection pool
│   │   └── schema.sql           # Database schema and migrations
│   ├── controllers/
│   │   ├── authController.ts    # Authentication endpoints
│   │   └── projectController.ts # Project CRUD endpoints
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts      # Global error handling
│   │   └── validation.ts        # Request validation middleware
│   ├── models/
│   │   ├── User.ts              # User data model
│   │   └── Project.ts           # Project data model
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   └── projects.ts          # Project routes
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── initDatabase.ts     # Database initialization utility
│   └── index.ts                 # Main application entry point
├── env.example                  # Environment variables template
├── package.json                 # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your database credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_tracker
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE project_tracker;
```

Initialize the database schema:

```bash
npm run init-db
```

Or manually run the schema:

```bash
psql -U postgres -d project_tracker -f src/config/schema.sql
```

### 4. Start the Server

Development mode with hot reload:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get user's projects | Yes |
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects/:id` | Get specific project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |
| GET | `/api/projects/stats` | Get project statistics | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |
| GET | `/` | API information |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request/Response Examples

### Register User

**Request:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Project

**Request:**
```json
POST /api/projects
Authorization: Bearer <token>
{
  "title": "My New Project",
  "description": "A detailed description of the project",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": 1,
      "title": "My New Project",
      "description": "A detailed description of the project",
      "status": "active",
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## 🔧 Development Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Initialize database
npm run init-db
```

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **JWT** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Parameterized queries

## 📊 Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Projects Table
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (VARCHAR CHECK)
- `user_id` (INTEGER FOREIGN KEY)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🚀 Deployment

The backend is ready for deployment on platforms like:
- **Render** - Easy deployment with automatic builds
- **Railway** - Modern deployment platform
- **Heroku** - Popular PaaS platform
- **DigitalOcean** - VPS deployment

Make sure to:
1. Set environment variables in your deployment platform
2. Configure PostgreSQL database
3. Update CORS settings for production domain
4. Use strong JWT secrets

## 📞 Support

For issues or questions, please check the API documentation or create an issue in the repository.
