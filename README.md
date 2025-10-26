# 📊 Project Tracker - Full-Stack Application

A comprehensive project management application built with **React + TypeScript**, **Node.js + Express**, and **PostgreSQL**. Features include multi-tenant data isolation, analytics dashboard, file ingestion, and background job processing.

## 🚀 Live Demo

- **Backend API:** [https://project-tracker-public.onrender.com](https://project-tracker-public.onrender.com)
- **Frontend:** [https://project-tracker-public-dqlrlmhsr-yazanbaker94s-projects.vercel.app](https://project-tracker-public-dqlrlmhsr-yazanbaker94s-projects.vercel.app)

---

## ✨ Features

### 🔐 **Authentication & Multi-Tenancy**
- JWT-based authentication (sign-up, login, logout)
- Multi-tenant data isolation with organizations
- Users can only access their organization's data

### 📋 **Project Management**
- Create, read, update, delete projects
- Project status tracking (active/completed)
- Automatic completion time tracking
- Organization-wide project visibility

### 📊 **Analytics Dashboard**
- Real-time project statistics
- User and organization-wide metrics
- Average completion time calculations
- Top contributors leaderboard
- Recent activity tracking
- **Background job recalculation** with progress tracking

### 📤 **File Ingestion System**
- Asynchronous file upload processing
- Job status tracking with real-time updates
- Mock file processing simulation
- Support for multiple file types (CSV, JSON, XML, PDF, etc.)

### ⚙️ **Background Jobs**
- Analytics recalculation with progress tracking
- Webhook-style callback system
- Job status monitoring
- Step-by-step processing feedback

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Axios** for API communication
- **Context API** for state management

### **Backend**
- **Node.js** with **Express**
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

### **DevOps & Security**
- **Helmet.js** for security headers
- **CORS** configuration
- **Morgan** for request logging
- **Environment-based configuration**

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd project-tracker
```

### **2. Backend Setup**

```bash
cd backend
npm install
```

#### **Environment Configuration**
Create a `.env` file in the `backend` directory:

```env
# Database Configuration (Choose one option)

# Option 1: Full Database URL (Recommended for production)
DATABASE_URL=postgresql://username:password@host:port/database

# Option 2: Individual Database Variables (for local development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_tracker
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (REQUIRED - Generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### **Database Setup**

**For Local Development:**
```bash
# Create database
createdb project_tracker

# Initialize database with all tables and features
npm run init-db
```

**For Production (with DATABASE_URL):**
```bash
# Initialize production database
npm run init-production-db
```

#### **Start Backend Server**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm run build
npm start
```

Backend will be available at: `http://localhost:5000`

### **3. Frontend Setup**

```bash
cd frontend
npm install
```

#### **Environment Configuration**
Create a `.env` file in the `frontend` directory:

```env
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# For production, use your deployed backend URL:
# REACT_APP_API_URL=https://project-tracker-public.onrender.com/api
```

#### **Start Frontend Server**
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following tables:

### **Core Tables**
- **`users`** - User accounts with organization association
- **`organizations`** - Multi-tenant organization data
- **`projects`** - Project data with completion tracking

### **Feature Tables**
- **`ingestion_jobs`** - File upload job tracking
- **`background_jobs`** - Background task processing

### **Automatic Features**
- **Triggers** for automatic timestamp updates
- **Indexes** for optimized queries
- **Foreign key constraints** for data integrity
- **Multi-tenant data isolation**

---

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### **Projects**
- `GET /api/projects` - List projects (organization-scoped)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get project statistics

### **Analytics**
- `GET /api/analytics/dashboard` - Complete analytics dashboard
- `GET /api/analytics/organization` - Organization analytics
- `GET /api/analytics/user` - User-specific analytics
- `GET /api/analytics/completion-time` - Average completion time

### **File Ingestion**
- `POST /api/ingest/init` - Initialize file upload
- `GET /api/ingest/status/:jobId` - Check job status
- `GET /api/ingest/jobs` - List user's jobs
- `GET /api/ingest/stats` - Ingestion statistics

### **Background Jobs**
- `POST /api/jobs/recompute-metrics` - Trigger analytics recalculation
- `GET /api/jobs/status/:jobId` - Check job status
- `GET /api/jobs` - List background jobs
- `GET /api/jobs/stats` - Job statistics

### **System**
- `GET /` - API documentation
- `GET /health` - Health check

---

## 🔧 Development

### **Available Scripts**

#### **Backend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run init-db      # Initialize local database
npm run init-production-db  # Initialize production database
```

#### **Frontend**
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### **Database Migrations**

The application includes several migration scripts:

```bash
# Individual migrations (if needed)
npm run migrate:organizations     # Add multi-tenant support
npm run migrate:analytics        # Add completion time tracking
npm run migrate:ingestion        # Add file ingestion features
npm run migrate:background-jobs  # Add background job processing
```

---

## 🚀 Deployment

### **Backend Deployment (Render/Heroku)**

1. **Set Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://project-tracker-public-dqlrlmhsr-yazanbaker94s-projects.vercel.app
```

2. **Deploy:**
   - Connect your Git repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables in dashboard

3. **Initialize Database:**
   - Run `npm run init-production-db` via dashboard shell
   - Or add to build command: `npm run build && npm run init-production-db`

### **Frontend Deployment (Vercel/Netlify)**

1. **Set Environment Variables:**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

2. **Deploy:**
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

---

## 🧪 Testing

### **API Testing with cURL**

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","first_name":"Test","last_name":"User"}'

# Login (copy token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Create project (use token)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Project","description":"Testing API","status":"active"}'

# Get analytics
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Frontend Testing**

1. Register a new account
2. Create some projects
3. Test project status updates
4. View analytics dashboard
5. Try file ingestion feature
6. Test background job recalculation

---

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcryptjs
- **CORS Protection** with configurable origins
- **Security Headers** with Helmet.js
- **Multi-tenant Data Isolation** - users can only access their organization's data
- **Environment Variable Protection** - sensitive data in .env files
- **SQL Injection Prevention** - parameterized queries
- **Input Validation** - request validation middleware

---

## 📁 Project Structure

```
project-tracker/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication, validation, errors
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Database initialization scripts
│   │   └── index.ts        # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React + TypeScript UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main app component
│   ├── .env.example        # Environment variables template
│   └── package.json
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 🎯 Key Features Demonstrated

### **Full-Stack Development**
- ✅ React frontend with TypeScript
- ✅ Node.js backend with Express
- ✅ PostgreSQL database integration
- ✅ RESTful API design

### **Advanced Patterns**
- ✅ **Multi-tenant architecture** with data isolation
- ✅ **Asynchronous job processing** with status tracking
- ✅ **Real-time updates** with polling
- ✅ **File upload simulation** with webhook callbacks
- ✅ **Background job processing** with progress tracking

### **Production Readiness**
- ✅ **Environment-based configuration**
- ✅ **Security best practices**
- ✅ **Error handling and validation**
- ✅ **Database migrations**
- ✅ **Deployment documentation**

### **User Experience**
- ✅ **Responsive design** with TailwindCSS
- ✅ **Loading states and error handling**
- ✅ **Real-time progress tracking**
- ✅ **Intuitive navigation** with tabs
- ✅ **Visual feedback** with progress bars and notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### **Common Issues**

**Database Connection Failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL or individual DB variables
- Ensure database exists and user has permissions

**CORS Errors:**
- Check FRONTEND_URL environment variable
- Ensure frontend URL matches CORS configuration

**JWT Token Errors:**
- Verify JWT_SECRET is set and consistent
- Check token expiration (7 days default)

**Build Errors:**
- Run `npm install` in both frontend and backend
- Check Node.js version (16+ required)
- Verify TypeScript compilation: `npm run build`

### **Getting Help**

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API endpoints individually with cURL
4. Check database connectivity and table creation

---

## 🎉 Success!

You now have a fully functional, production-ready project management application with:

- 🔐 **Secure authentication** with multi-tenant support
- 📊 **Advanced analytics** with real-time recalculation
- 📤 **File processing** with job tracking
- ⚙️ **Background jobs** with progress monitoring
- 🎨 **Modern UI** with responsive design
- 🚀 **Deployment ready** with comprehensive documentation

**Happy coding!** 🚀
