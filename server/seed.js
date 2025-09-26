const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");
const Notification = require("./models/Notification");
const ActivityLog = require("./models/ActivityLog");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/team-tracker"
    );
    console.log("MongoDB Connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@company.com",
      password: "password123",
      role: "admin",
      company: "Tech Solutions Inc.",
      phone: "+1-555-0101",
    });
    await adminUser.save();
    console.log("Admin user created");

    // Create manager user
    const managerUser = new User({
      name: "John Manager",
      email: "manager@company.com",
      password: "password123",
      role: "manager",
      company: "Tech Solutions Inc.",
      phone: "+1-555-0102",
    });
    await managerUser.save();
    console.log("Manager user created");

    // Create member users
    const memberUsers = [
      {
        name: "Alice Johnson",
        email: "alice.johnson@company.com",
        password: "password123",
        role: "member",
        company: "Tech Solutions Inc.",
        phone: "+1-555-0103",
      },
      {
        name: "Bob Smith",
        email: "bob.smith@company.com",
        password: "password123",
        role: "member",
        company: "Tech Solutions Inc.",
        phone: "+1-555-0104",
      },
      {
        name: "Carol Davis",
        email: "carol.davis@company.com",
        password: "password123",
        role: "member",
        company: "Tech Solutions Inc.",
        phone: "+1-555-0105",
      },
    ];

    const createdMembers = [];
    for (const memberData of memberUsers) {
      const member = new User(memberData);
      await member.save();
      createdMembers.push(member);
    }
    console.log("Member users created");

    // Create sample projects
    const projects = [
      {
        title: "E-commerce Platform",
        description:
          "Build a modern e-commerce platform with React and Node.js",
        owner: adminUser._id,
      },
      {
        title: "Mobile App Development",
        description:
          "Develop a cross-platform mobile application using React Native",
        owner: managerUser._id,
      },
      {
        title: "Data Analytics Dashboard",
        description:
          "Create a comprehensive analytics dashboard for business intelligence",
        owner: adminUser._id,
      },
      {
        title: "Customer Support Portal",
        description: "Build a customer support and ticketing system",
        owner: managerUser._id,
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log("Sample projects created");

    // Create sample tasks
    const tasks = [
      {
        title: "Set up Project Architecture",
        description:
          "Define and implement the overall project architecture and folder structure",
        assignee_id: createdMembers[0]._id, // Alice Johnson
        project_id: createdProjects[0]._id, // E-commerce Platform
        status: "completed",
        priority: "high",
        dueDate: new Date("2024-01-15"),
        createdBy: managerUser._id,
        completedAt: new Date("2024-01-12"),
        comments: [
          {
            author: managerUser._id,
            text: "Started working on the project structure. Setting up the main folders and configuration files.",
            timestamp: new Date("2024-01-10T09:00:00Z"),
          },
          {
            author: createdMembers[0]._id,
            text: "Project architecture is complete. Created folder structure for components, services, and utilities.",
            timestamp: new Date("2024-01-12T14:30:00Z"),
          },
          {
            author: managerUser._id,
            text: "Great work! The structure looks clean and well-organized.",
            timestamp: new Date("2024-01-12T16:15:00Z"),
          },
        ],
      },
      {
        title: "Design User Interface",
        description:
          "Create wireframes and mockups for the main user interface",
        assignee_id: createdMembers[1]._id, // Bob Smith
        project_id: createdProjects[0]._id, // E-commerce Platform
        status: "in-progress",
        priority: "high",
        dueDate: new Date("2024-01-20"),
        createdBy: managerUser._id,
        comments: [
          {
            author: createdMembers[1]._id,
            text: "Working on the wireframes for the main dashboard. Should have initial mockups ready by tomorrow.",
            timestamp: new Date("2024-01-18T10:30:00Z"),
          },
          {
            author: managerUser._id,
            text: "Looking forward to seeing the designs. Please make sure to follow our brand guidelines.",
            timestamp: new Date("2024-01-18T11:45:00Z"),
          },
        ],
      },
      {
        title: "Implement Authentication System",
        description:
          "Develop user login, registration, and password reset functionality",
        assignee_id: createdMembers[0]._id, // Alice Johnson
        project_id: createdProjects[1]._id, // Mobile App Development
        status: "in-progress",
        priority: "medium",
        dueDate: new Date("2024-01-25"),
        createdBy: adminUser._id,
        comments: [
          {
            author: createdMembers[0]._id,
            text: "Starting with JWT implementation. Will need to set up password hashing and validation.",
            timestamp: new Date("2024-01-22T08:15:00Z"),
          },
          {
            author: adminUser._id,
            text: "Please make sure to implement proper security measures and follow OWASP guidelines.",
            timestamp: new Date("2024-01-22T09:30:00Z"),
          },
        ],
      },
      {
        title: "Create API Endpoints",
        description:
          "Develop RESTful API endpoints for mobile app functionality",
        assignee_id: createdMembers[2]._id, // Carol Davis
        project_id: createdProjects[1]._id, // Mobile App Development
        status: "todo",
        priority: "medium",
        dueDate: new Date("2024-01-30"),
        createdBy: adminUser._id,
        comments: [
          {
            author: adminUser._id,
            text: "Please prioritize the user management endpoints first. The mobile team is waiting for these APIs.",
            timestamp: new Date("2024-01-19T11:00:00Z"),
          },
        ],
      },
      {
        title: "Design Dashboard Layout",
        description:
          "Create the layout and components for the analytics dashboard",
        assignee_id: createdMembers[1]._id, // Bob Smith
        project_id: createdProjects[2]._id, // Data Analytics Dashboard
        status: "todo",
        priority: "low",
        dueDate: new Date("2024-02-05"),
        createdBy: adminUser._id,
      },
      {
        title: "Implement Data Visualization",
        description:
          "Add charts and graphs for data visualization in the dashboard",
        assignee_id: createdMembers[0]._id, // Alice Johnson
        project_id: createdProjects[2]._id, // Data Analytics Dashboard
        status: "todo",
        priority: "medium",
        dueDate: new Date("2024-02-10"),
        createdBy: adminUser._id,
      },
      {
        title: "Build Ticket System",
        description:
          "Create the core ticketing functionality for customer support",
        assignee_id: createdMembers[2]._id, // Carol Davis
        project_id: createdProjects[3]._id, // Customer Support Portal
        status: "in-progress",
        priority: "high",
        dueDate: new Date("2024-01-28"),
        createdBy: managerUser._id,
        comments: [
          {
            author: createdMembers[2]._id,
            text: "Working on the ticket creation and assignment logic. About 60% complete.",
            timestamp: new Date("2024-01-23T14:20:00Z"),
          },
          {
            author: managerUser._id,
            text: "Great progress! Let me know if you need any help with the priority classification system.",
            timestamp: new Date("2024-01-23T15:45:00Z"),
          },
          {
            author: createdMembers[2]._id,
            text: "Actually, I could use some guidance on the priority algorithm. Can we schedule a quick meeting?",
            timestamp: new Date("2024-01-24T09:15:00Z"),
          },
        ],
      },
      {
        title: "Setup Email Notifications",
        description:
          "Implement email notifications for ticket updates and assignments",
        assignee_id: createdMembers[1]._id, // Bob Smith
        project_id: createdProjects[3]._id, // Customer Support Portal
        status: "todo",
        priority: "medium",
        dueDate: new Date("2024-02-12"),
        createdBy: managerUser._id,
      },
      {
        title: "Write Unit Tests",
        description: "Create comprehensive unit tests for all major components",
        assignee_id: createdMembers[0]._id, // Alice Johnson
        project_id: createdProjects[0]._id, // E-commerce Platform
        status: "todo",
        priority: "medium",
        dueDate: new Date("2024-02-08"),
        createdBy: adminUser._id,
      },
      {
        title: "Performance Optimization",
        description: "Optimize application performance and database queries",
        assignee_id: createdMembers[2]._id, // Carol Davis
        project_id: createdProjects[1]._id, // Mobile App Development
        status: "completed",
        priority: "low",
        dueDate: new Date("2024-01-18"),
        createdBy: adminUser._id,
        completedAt: new Date("2024-01-16"),
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log("Sample tasks created");

    // Create sample notifications
    const notifications = [
      {
        recipient: createdMembers[0]._id, // Alice Johnson
        sender: managerUser._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message:
          'You have been assigned a new task: "Set up Project Architecture"',
        relatedTask: createdTasks[0]._id,
        relatedProject: createdProjects[0]._id,
        isRead: true,
        readAt: new Date("2024-01-10T10:00:00Z"),
      },
      {
        recipient: createdMembers[1]._id, // Bob Smith
        sender: managerUser._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message: 'You have been assigned a new task: "Design User Interface"',
        relatedTask: createdTasks[1]._id,
        relatedProject: createdProjects[0]._id,
        isRead: false,
      },
      {
        recipient: createdMembers[0]._id, // Alice Johnson
        sender: adminUser._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message:
          'You have been assigned a new task: "Implement Authentication System"',
        relatedTask: createdTasks[2]._id,
        relatedProject: createdProjects[1]._id,
        isRead: false,
      },
      {
        recipient: managerUser._id,
        sender: createdMembers[0]._id,
        type: "task_completed",
        title: "Task Completed",
        message:
          'Task "Set up Project Architecture" has been marked as completed',
        relatedTask: createdTasks[0]._id,
        relatedProject: createdProjects[0]._id,
        isRead: false,
      },
      {
        recipient: createdMembers[2]._id, // Carol Davis
        sender: adminUser._id,
        type: "task_assigned",
        title: "New Task Assigned",
        message: 'You have been assigned a new task: "Create API Endpoints"',
        relatedTask: createdTasks[3]._id,
        relatedProject: createdProjects[1]._id,
        isRead: false,
      },
      {
        recipient: createdMembers[1]._id, // Bob Smith
        sender: managerUser._id,
        type: "comment_added",
        title: "New Comment on Task",
        message:
          'New comment on "Design User Interface": "Looking forward to seeing the designs..."',
        relatedTask: createdTasks[1]._id,
        relatedProject: createdProjects[0]._id,
        isRead: false,
      },
      {
        recipient: managerUser._id,
        sender: createdMembers[2]._id,
        type: "comment_added",
        title: "New Comment on Task",
        message:
          'New comment on "Build Ticket System": "Actually, I could use some guidance on the..."',
        relatedTask: createdTasks[5]._id,
        relatedProject: createdProjects[3]._id,
        isRead: true,
        readAt: new Date("2024-01-24T10:00:00Z"),
      },
    ];

    const createdNotifications = await Notification.insertMany(notifications);
    console.log("Sample notifications created");

    // Create sample activity logs
    const activityLogs = [
      {
        userId: adminUser._id,
        action: "user_login",
        description: "User logged into the system",
        entityType: "user",
        entityId: adminUser._id,
        entityName: adminUser.name,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: {
          email: adminUser.email,
          role: adminUser.role,
          lastLogin: new Date("2024-01-24T08:00:00Z"),
        },
        createdAt: new Date("2024-01-24T08:00:00Z"),
      },
      {
        userId: managerUser._id,
        action: "project_created",
        description: 'Created project "E-commerce Platform"',
        entityType: "project",
        entityId: createdProjects[0]._id,
        entityName: createdProjects[0].title,
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        metadata: {
          ownerName: managerUser.name,
          descriptionLength: createdProjects[0].description.length,
        },
        createdAt: new Date("2024-01-09T14:30:00Z"),
      },
      {
        userId: managerUser._id,
        action: "task_assigned",
        description:
          'Assigned task "Set up Project Architecture" to Alice Johnson',
        entityType: "task",
        entityId: createdTasks[0]._id,
        entityName: createdTasks[0].title,
        relatedEntityType: "project",
        relatedEntityId: createdProjects[0]._id,
        relatedEntityName: createdProjects[0].title,
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        metadata: {
          priority: createdTasks[0].priority,
          assigneeName: createdMembers[0].name,
          projectName: createdProjects[0].title,
        },
        createdAt: new Date("2024-01-10T09:00:00Z"),
      },
      {
        userId: createdMembers[0]._id,
        action: "task_completed",
        description: 'Marked task "Set up Project Architecture" as completed',
        entityType: "task",
        entityId: createdTasks[0]._id,
        entityName: createdTasks[0].title,
        relatedEntityType: "project",
        relatedEntityId: createdProjects[0]._id,
        relatedEntityName: createdProjects[0].title,
        ipAddress: "192.168.1.102",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: {
          newStatus: "completed",
        },
        createdAt: new Date("2024-01-12T14:30:00Z"),
      },
      {
        userId: createdMembers[1]._id,
        action: "task_commented",
        description:
          'Added comment on task "Design User Interface": "Working on the wireframes for the..."',
        entityType: "comment",
        entityId: new mongoose.Types.ObjectId(), // Mock comment ID
        entityName: "Working on the wireframes for the...",
        relatedEntityType: "task",
        relatedEntityId: createdTasks[1]._id,
        relatedEntityName: createdTasks[1].title,
        ipAddress: "192.168.1.103",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        metadata: {
          commentLength: 85,
          taskAssignee: createdMembers[1].name,
          taskStatus: "in-progress",
        },
        createdAt: new Date("2024-01-18T10:30:00Z"),
      },
      {
        userId: createdMembers[2]._id,
        action: "user_login",
        description: "User logged into the system",
        entityType: "user",
        entityId: createdMembers[2]._id,
        entityName: createdMembers[2].name,
        ipAddress: "192.168.1.104",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: {
          email: createdMembers[2].email,
          role: createdMembers[2].role,
          lastLogin: new Date("2024-01-23T09:15:00Z"),
        },
        createdAt: new Date("2024-01-23T09:15:00Z"),
      },
      {
        userId: adminUser._id,
        action: "project_created",
        description: 'Created project "Mobile App Development"',
        entityType: "project",
        entityId: createdProjects[1]._id,
        entityName: createdProjects[1].title,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: {
          ownerName: managerUser.name,
          descriptionLength: createdProjects[1].description.length,
        },
        createdAt: new Date("2024-01-15T11:20:00Z"),
      },
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log("Sample activity logs created");

    console.log("\n🎉 Sample data seeded successfully!");
    console.log("\nTest Accounts:");
    console.log("Admin: admin@company.com / password123");
    console.log("Manager: manager@company.com / password123");
    console.log("Alice (Member): alice.johnson@company.com / password123");
    console.log("Bob (Member): bob.smith@company.com / password123");
    console.log("Carol (Member): carol.davis@company.com / password123");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedData();
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedData };
