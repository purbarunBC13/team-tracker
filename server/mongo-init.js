// MongoDB initialization script
db = db.getSiblingDB("team-tracker");

// Create collections
db.createCollection("users");
db.createCollection("tasks");
db.createCollection("projects");
db.createCollection("teammembers");
db.createCollection("notifications");
db.createCollection("activitylogs");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ assignee_id: 1 });
db.tasks.createIndex({ project_id: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.projects.createIndex({ owner: 1 });
db.teammembers.createIndex({ email: 1 }, { unique: true });
db.notifications.createIndex({ user_id: 1 });
db.notifications.createIndex({ isRead: 1 });
db.activitylogs.createIndex({ user_id: 1 });
db.activitylogs.createIndex({ createdAt: 1 });

print("Database initialized successfully!");
