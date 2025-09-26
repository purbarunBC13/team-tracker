// Base interface for documents with MongoDB timestamps
interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// User interface based on User.js model
export interface User extends BaseDocument {
  name: string;
  email: string;
  password?: string; // Optional as it's excluded in toJSON
  role: "admin" | "manager" | "member";
  company: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

// TeamMember interface based on TeamMember.js model
export interface TeamMember extends BaseDocument {
  name: string;
  email: string;
  role: string;
  department: string;
  joiningDate: string;
  status: "active" | "inactive";
  avatar?: string;
  createdBy: string; // ObjectId reference to User
}

// Project interface based on Project.js model
export interface Project extends BaseDocument {
  title: string;
  description: string;
  owner: string; // ObjectId reference to User
}

// Comment interface for Task comments
export interface Comment {
  _id: string;
  author: string; // ObjectId reference to User
  text: string;
  timestamp: string;
}

// Task interface based on Task.js model
export interface Task extends BaseDocument {
  title: string;
  description: string;
  assignee_id: string; // ObjectId reference to User
  project_id?: string; // ObjectId reference to Project (optional)
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdBy: string; // ObjectId reference to User
  completedAt?: string;
  comments: Comment[];
}

// Notification interface based on Notification.js model
export interface Notification extends BaseDocument {
  recipient: string; // ObjectId reference to User
  sender: string; // ObjectId reference to User
  type:
    | "task_assigned"
    | "task_updated"
    | "task_completed"
    | "comment_added"
    | "project_assigned"
    | "task_reassigned";
  title: string;
  message: string;
  relatedTask?: string; // ObjectId reference to Task
  relatedProject?: string; // ObjectId reference to Project
  isRead: boolean;
  readAt?: string;
}

// ActivityLog interface based on ActivityLog.js model
export interface ActivityLog extends BaseDocument {
  userId: string; // ObjectId reference to User
  action:
    | "user_login"
    | "user_logout"
    | "user_register"
    | "project_created"
    | "project_updated"
    | "project_deleted"
    | "task_created"
    | "task_updated"
    | "task_assigned"
    | "task_reassigned"
    | "task_status_changed"
    | "task_completed"
    | "task_deleted"
    | "task_commented"
    | "comment_updated"
    | "comment_deleted"
    | "team_member_added"
    | "team_member_updated"
    | "team_member_removed";
  description: string;
  entityType?: "user" | "project" | "task" | "comment" | "team_member";
  entityId?: string;
  entityName?: string;
  relatedEntityType?: "user" | "project" | "task" | "comment" | "team_member";
  relatedEntityId?: string;
  relatedEntityName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// API Response types for common operations
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Populated types for when references are populated
export interface PopulatedTask
  extends Omit<Task, "assignee_id" | "project_id" | "createdBy" | "comments"> {
  assignee_id: User;
  project_id?: Project; // Optional since project_id is optional
  createdBy: User;
  comments: (Omit<Comment, "author"> & { author: User })[];
}

export interface PopulatedNotification
  extends Omit<
    Notification,
    "recipient" | "sender" | "relatedTask" | "relatedProject"
  > {
  recipient: User;
  sender: User;
  relatedTask?: Task;
  relatedProject?: Project;
}

export interface PopulatedActivityLog extends Omit<ActivityLog, "userId"> {
  userId: User;
}
