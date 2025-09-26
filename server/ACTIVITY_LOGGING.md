# Activity Logging System

## Overview

The activity logging system tracks all significant user actions and system events in the Team Tracker application. This provides a comprehensive audit trail for compliance, debugging, and analytics purposes.

## Database Schema

### ActivityLog Collection (`activity_logs`)

**Fields:**

- `userId` (ObjectId, required): Reference to the user who performed the action
- `action` (String, required): Type of action performed (see Action Types below)
- `description` (String, required): Human-readable description of the action
- `entityType` (String): Type of entity affected (user, project, task, comment, team_member)
- `entityId` (ObjectId): ID of the affected entity
- `entityName` (String): Name/title of the affected entity
- `relatedEntityType` (String): Type of related entity (e.g., project for a task)
- `relatedEntityId` (ObjectId): ID of the related entity
- `relatedEntityName` (String): Name of the related entity
- `metadata` (Mixed): Additional contextual data
- `ipAddress` (String): IP address of the user
- `userAgent` (String): Browser/client user agent
- `createdAt` (Date): Timestamp when the action occurred
- `updatedAt` (Date): Timestamp when the record was last updated

**Indexes:**

- `{ userId: 1, createdAt: -1 }` - User activity queries
- `{ action: 1, createdAt: -1 }` - Action-based queries
- `{ entityType: 1, entityId: 1, createdAt: -1 }` - Entity-specific queries
- `{ createdAt: -1 }` - General time-based queries

## Action Types

### Authentication Actions

- `user_login` - User successfully logged in
- `user_logout` - User logged out
- `user_register` - New user registration

### Project Actions

- `project_created` - New project created
- `project_updated` - Project details updated
- `project_deleted` - Project deleted

### Task Actions

- `task_created` - New task created
- `task_updated` - Task details updated
- `task_assigned` - Task assigned to user
- `task_reassigned` - Task reassigned to different user
- `task_status_changed` - Task status modified
- `task_completed` - Task marked as completed
- `task_deleted` - Task deleted

### Comment Actions

- `task_commented` - Comment added to task
- `comment_updated` - Comment text modified
- `comment_deleted` - Comment removed

### Team Member Actions

- `team_member_added` - New team member added
- `team_member_updated` - Team member information updated
- `team_member_removed` - Team member removed

## API Endpoints

### Activity Logs Management

```
GET /api/activity-logs                    - Get all activity logs (admin only)
GET /api/activity-logs/my-activity        - Get current user's activity
GET /api/activity-logs/stats              - Get activity statistics (admin only)
GET /api/activity-logs/recent             - Get recent activity (admin/manager)
DELETE /api/activity-logs/cleanup         - Clean up old logs (admin only)
```

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50 for admin, 25 for user)
- `action` - Filter by action type
- `entityType` - Filter by entity type
- `userId` - Filter by specific user (admin only)
- `startDate` - Filter from date (ISO string)
- `endDate` - Filter to date (ISO string)
- `groupBy` - Group statistics by field (action, entityType, userId)

## Automatic Logging

### Authentication Events

- **Login**: Logged when user successfully authenticates
- **Registration**: Logged when new user account is created
- **Logout**: Logged when user explicitly logs out

### Project Events

- **Creation**: Logged when new project is created
- **Updates**: Logged when project details are modified
- **Deletion**: Logged when project is deleted (if implemented)

### Task Events

- **Creation**: Logged when new task is created
- **Assignment**: Logged when task is assigned to user
- **Status Changes**: Logged when task status is modified
- **Updates**: Logged when task details are changed
- **Completion**: Logged when task is marked as completed
- **Reassignment**: Logged when task is assigned to different user

### Comment Events

- **Creation**: Logged when comment is added to task
- **Updates**: Logged when comment text is modified
- **Deletion**: Logged when comment is removed

## Usage Examples

### Getting User Activity

```javascript
const activities = await ActivityLog.getUserActivity(userId, {
  limit: 50,
  action: "task_created",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
});
```

### Getting System Statistics

```javascript
const stats = await ActivityLog.getActivityStats({
  startDate: new Date("2024-01-01"),
  groupBy: "action",
});
```

### Manual Activity Logging

```javascript
const { logTaskActivity } = require("../utils/activityLogger");

await logTaskActivity(userId, "task_completed", task, req, {
  completionTime: new Date(),
  previousStatus: "in-progress",
});
```

## Security & Privacy

- **Access Control**: Full activity logs are only accessible to admins
- **User Activity**: Users can only view their own activity logs
- **IP Tracking**: IP addresses are logged for security auditing
- **Data Retention**: Cleanup endpoint allows removal of old logs
- **Sensitive Data**: Passwords and sensitive information are never logged

## Performance Considerations

- **Indexes**: Optimized indexes for common query patterns
- **Cleanup**: Regular cleanup of old logs to maintain performance
- **Async Logging**: Activity logging doesn't block main operations
- **Error Handling**: Failed logging doesn't affect main functionality

## Monitoring & Alerting

- **Failed Operations**: Monitor for patterns of failed activities
- **Unusual Access**: Track unusual login patterns or access times
- **System Usage**: Analyze activity patterns for capacity planning
- **Audit Trails**: Complete audit trail for compliance requirements

## Configuration

### Environment Variables

- `ACTIVITY_LOG_RETENTION_DAYS` - Days to keep activity logs (default: 90)
- `ACTIVITY_LOG_ENABLED` - Enable/disable activity logging (default: true)

### Cleanup Schedule

- Recommended: Run cleanup weekly to remove logs older than 90 days
- Can be automated using cron jobs or scheduled tasks
- Cleanup endpoint: `DELETE /api/activity-logs/cleanup`
