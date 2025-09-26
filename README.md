# Team Tracker - Project Management Application

A comprehensive team management application built with React, Node.js, Express, and MongoDB. Features user management, project tracking, task assignment, and analytics dashboard.

## Architecture Overview

### System Design Choices

**Frontend: React + TypeScript**

- **React 18** with functional components and hooks for modern development patterns
- **TypeScript** for type safety and better developer experience
- **Context API** for state management - chosen over Redux for simplicity and built-in React integration
- **Tailwind CSS** for utility-first styling and rapid UI development
- **Framer Motion** for smooth animations without performance overhead

**Backend: Node.js + Express + MongoDB**

- **Express.js** for RESTful API - lightweight and flexible for rapid development
- **MongoDB with Mongoose** for document-based data storage - ideal for flexible schema evolution
- **JWT authentication** for stateless, scalable user sessions
- **bcrypt** for secure password hashing with configurable salt rounds

**Architecture Reasoning:**

- **Separation of concerns**: Clear frontend/backend boundary with REST API communication
- **Scalability**: Stateless JWT auth and MongoDB horizontal scaling capabilities
- **Developer experience**: TypeScript throughout, comprehensive error handling, and structured project organization
- **Real-time features**: Context API for immediate UI updates, structured for easy WebSocket integration
- **Security first**: Input validation, password hashing, CORS protection, and environment-based configuration

## Setup & Run

### Single-Command Start (Recommended)

```bash
git clone https://github.com/purbarunBC13/team-tracker.git
cd team-tracker
npm run dev:setup
```

This command will:

1. Install all dependencies (client + server)
2. Set up environment files with defaults
3. Start MongoDB (if Docker available)
4. Seed the database with sample data
5. Start both frontend and backend concurrently

### Manual Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/purbarunBC13/team-tracker.git
   cd team-tracker

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

2. **Environment setup**

   ```bash
   # Copy environment templates
   cp server/.env.example server/.env
   cp client/.env.example client/.env.development
   ```

3. **Start services**

   ```bash
   # Terminal 1: Start MongoDB (if local)
   mongod

   # Terminal 2: Start backend server
   cd server && npm run dev

   # Terminal 3: Start frontend client
   cd client && npm start
   ```

### Docker Setup (Optional)

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose up --build -d
```

**Access Points:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Environment Variables

### Server (.env)

| Variable        | Default                                  | Description                               |
| --------------- | ---------------------------------------- | ----------------------------------------- |
| `NODE_ENV`      | `development`                            | Application environment                   |
| `MONGO_URI`     | `mongodb://localhost:27017/team-tracker` | MongoDB connection string                 |
| `JWT_SECRET`    | `your-super-secret-jwt-key-change-this`  | JWT signing secret (CHANGE IN PRODUCTION) |
| `PORT`          | `5000`                                   | Server port                               |
| `CLIENT_URL`    | `http://localhost:3000`                  | Frontend URL for CORS                     |
| `BCRYPT_ROUNDS` | `12`                                     | Password hashing salt rounds              |
| `JWT_EXPIRE`    | `7d`                                     | JWT token expiration time                 |

### Client (.env.development)

| Variable                 | Default                     | Description          |
| ------------------------ | --------------------------- | -------------------- |
| `REACT_APP_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |
| `REACT_APP_ENV`          | `development`               | Frontend environment |

## Database Seeding

### Quick Seed

```bash
cd server
node seed-improved.js
```

### Seed Options

```bash
# Original seed with basic data
node seed.js

# Comprehensive seed with realistic data
node seed-improved.js

# Custom seed for testing
npm run seed:test
```

**Seed Data Includes:**

- **10 Users**: 1 admin, 2 managers, 7 members (including 1 inactive)
- **6 Projects**: Realistic projects across different domains
- **20+ Tasks**: Various statuses, priorities, with comments
- **50+ Notifications**: All notification types covered
- **100+ Activity Logs**: Comprehensive audit trail

**Test Accounts:**
| Role | Email | Password |
|------|--------|----------|
| Admin | admin@company.com | password123 |
| Manager | sarah.johnson@company.com | password123 |
| Member | alex.rodriguez@company.com | password123 |
| Member | emma.thompson@company.com | password123 |

## Running Tests

### Test Suites

```bash
# Run all tests (client + server)
npm test

# Run server tests only
cd server && npm test

# Run client tests only
cd client && npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
server/
├── __tests__/
│   ├── auth.test.js          # Authentication tests
│   ├── tasks.test.js         # Task management tests
│   ├── projects.test.js      # Project CRUD tests
│   └── analytics.test.js     # Analytics endpoint tests
└── test-utils/
    ├── setup.js              # Test database setup
    └── helpers.js            # Test helper functions

client/
├── src/__tests__/
│   ├── components/           # Component unit tests
│   ├── contexts/             # Context provider tests
│   └── pages/                # Page integration tests
└── test-utils/
    └── render.tsx            # Testing library setup
```

**Test Coverage Areas:**

- ✅ API endpoints (auth, CRUD operations)
- ✅ Database models and validation
- ✅ Authentication middleware
- ✅ React component rendering
- ✅ Context state management
- ✅ User interaction flows

## Things I Would Do Next / Tradeoffs

### Immediate Improvements

• **Real-time Updates**: Implement WebSocket connections for live task updates and notifications instead of polling. Current REST API approach is simpler but less responsive.

• **Caching Strategy**: Add Redis for session storage and API response caching. Currently using in-memory storage which doesn't scale across multiple server instances.

• **File Uploads**: Implement file attachment system for tasks using AWS S3 or similar. Avoided initially to keep deployment simple, but limits task documentation capabilities.

### Scalability & Performance

• **Database Optimization**: Add proper indexing strategies and implement database connection pooling. Current setup works for small teams but would need optimization for 100+ concurrent users.

• **API Rate Limiting**: Implement sophisticated rate limiting per user/IP. Basic CORS protection is in place but production needs more robust API protection against abuse.

• **Testing Coverage**: Expand test suite to include E2E testing with Cypress and performance testing. Current unit tests cover core functionality but integration testing is minimal for rapid development.

---

**Quick Start:** `npm run dev:setup` → Visit http://localhost:3000
