# Team Tracker - Backend API

A comprehensive Express.js/MongoDB backend for project and task management system **as per requirement document**.

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Manager, Member)
- Secure password hashing with bcrypt
- User registration and login
- Profile management

### Project Management (As Required)

- **Projects CRUD operations** with id, title, description, owner fields
- Project creation by admin/manager users
- Project ownership and access control
- Project-specific task management
- Project analytics and statistics

### Task Management (Updated Schema)

- Create, assign, and track tasks with **assignee_id** field
- Link tasks to projects with **project_id** field
- Task priorities (low, medium, high)
- Task statuses (todo, in-progress, completed)
- Due date tracking and overdue detection
- Task assignment to users via assignee_id

### Analytics & Reporting

- Dashboard analytics with comprehensive metrics
- Individual user performance tracking
- Project-wise analytics
- Task completion trends
- Performance over time analysis

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password

### Team Members (`/api/team-members`)

- `GET /` - Get all team members (with filtering)
- `GET /:id` - Get single team member
- `POST /` - Create team member (Admin/Manager)
- `PUT /:id` - Update team member (Admin/Manager)
- `DELETE /:id` - Delete team member (Admin only)
- `GET /stats/overview` - Get team statistics

### Tasks (`/api/tasks`)

- `GET /` - Get all tasks (with filtering & pagination)
- `GET /:id` - Get single task
- `POST /` - Create task (Admin/Manager)
- `PUT /:id` - Update task (Admin/Manager)
- `PATCH /:id/status` - Update task status
- `DELETE /:id` - Delete task (Admin only)
- `GET /stats/overview` - Get task statistics
- `GET /my-tasks` - Get current user's tasks

### Analytics (`/api/analytics`)

- `GET /dashboard` - Get dashboard analytics
- `GET /member/:id` - Get member analytics
- `GET /department/:department` - Get department analytics

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/team-tracker
JWT_SECRET=your-super-secure-jwt-secret
CLIENT_URL=http://localhost:3000
```

### Installation Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start MongoDB:**

   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas connection string

3. **Seed sample data (optional):**

   ```bash
   node seed.js
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Start the production server:**
   ```bash
   npm start
   ```

## Sample Data

The seeder creates:

### Test Users

- **Admin:** admin@company.com / password123
- **Manager:** manager@company.com / password123
- **Member:** developer@company.com / password123

### Team Members

- 5 sample team members across different departments
- Various roles and joining dates

### Tasks

- 8 sample tasks with different priorities and statuses
- Assigned to different team members
- Mix of completed, in-progress, and pending tasks

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10,
  "totalPages": 5,
  "currentPage": 1
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication

### JWT Token Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

### Role-based Access

- **Admin:** Full access to all resources
- **Manager:** Can manage team members and tasks
- **Member:** Can view data and update own task status

## Database Schema

### User Model

- name, email, password, role, company, phone
- Password hashing and JWT integration
- Role-based permissions

### TeamMember Model

- name, email, role, department, joiningDate, status
- Reference to creator (User)
- Indexed for performance

### Task Model

- title, description, assignedTo, status, priority, dueDate
- References to TeamMember and User
- Automatic completion tracking

## Error Handling

- Comprehensive error middleware
- Validation error handling
- Database error handling
- JWT error handling
- Custom error messages

## Security Features

- Password hashing with bcrypt
- JWT token expiration
- Input validation and sanitization
- CORS configuration
- Rate limiting ready
- SQL injection prevention with Mongoose

## Performance Optimizations

- Database indexing for frequent queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling with Mongoose
- Query optimization

## Development Tools

- **Nodemon** - Auto-restart during development
- **Morgan** - HTTP request logging
- **ESLint** ready configuration
- **Prettier** ready configuration

## Production Considerations

1. **Environment Variables:**

   - Use production MongoDB URI
   - Strong JWT secret
   - Set NODE_ENV=production

2. **Security:**

   - Enable rate limiting
   - Use HTTPS
   - Implement API key authentication for sensitive operations
   - Add request validation middleware

3. **Performance:**

   - Enable compression middleware
   - Implement caching (Redis)
   - Use MongoDB Atlas for scaling
   - Monitor performance metrics

4. **Monitoring:**
   - Add logging service (Winston)
   - Error tracking (Sentry)
   - Performance monitoring
   - Health check endpoints

## API Testing

Use the health check endpoint to verify the server is running:

```
GET /health
```

Expected response:

```json
{
  "success": true,
  "message": "Team Tracker API is running!",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test API endpoints thoroughly

## License

This project is licensed under the ISC License.
