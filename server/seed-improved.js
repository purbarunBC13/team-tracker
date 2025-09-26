const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");
const TeamMember = require("./models/TeamMember");
const Notification = require("./models/Notification");
const ActivityLog = require("./models/ActivityLog");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/team-tracker",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      TeamMember.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    console.log("👥 Creating users...");

    const users = [
      {
        name: "Admin User",
        email: "admin@company.com",
        password: "password123",
        role: "admin",
        company: "TechFlow Solutions",
        phone: "+1-555-0100",
        isActive: true,
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        password: "password123",
        role: "manager",
        company: "TechFlow Solutions",
        phone: "+1-555-0101",
        isActive: true,
      },
      {
        name: "Mike Chen",
        email: "mike.chen@company.com",
        password: "password123",
        role: "manager",
        company: "TechFlow Solutions",
        phone: "+1-555-0102",
        isActive: true,
      },
      {
        name: "Alex Rodriguez",
        email: "alex.rodriguez@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0103",
        isActive: true,
      },
      {
        name: "Emma Thompson",
        email: "emma.thompson@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0104",
        isActive: true,
      },
      {
        name: "David Kim",
        email: "david.kim@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0105",
        isActive: true,
      },
      {
        name: "Lisa Wang",
        email: "lisa.wang@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0106",
        isActive: true,
      },
      {
        name: "James Wilson",
        email: "james.wilson@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0107",
        isActive: false, // Inactive user
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0108",
        isActive: true,
      },
      {
        name: "Robert Brown",
        email: "robert.brown@company.com",
        password: "password123",
        role: "member",
        company: "TechFlow Solutions",
        phone: "+1-555-0109",
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};

const seedTeamMembers = async (users) => {
  try {
    console.log("👥 Creating team members...");

    // Use admin as the creator for all team members
    const adminUser = users.find((user) => user.role === "admin");

    const teamMembers = [
      {
        name: "Alex Rodriguez",
        email: "alex.rodriguez@company.com",
        role: "Frontend Developer",
        department: "Engineering",
        joiningDate: new Date("2023-06-15"),
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Emma Thompson",
        email: "emma.thompson@company.com",
        role: "Backend Developer",
        department: "Engineering",
        joiningDate: new Date("2023-07-01"),
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "David Kim",
        email: "david.kim@company.com",
        role: "DevOps Engineer",
        department: "Engineering",
        joiningDate: new Date("2023-08-15"),
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Lisa Wang",
        email: "lisa.wang@company.com",
        role: "UI/UX Designer",
        department: "Design",
        joiningDate: new Date("2023-05-20"),
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "James Wilson",
        email: "james.wilson@company.com",
        role: "QA Engineer",
        department: "Quality Assurance",
        joiningDate: new Date("2023-04-10"),
        status: "inactive",
        createdBy: adminUser._id,
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@company.com",
        role: "Product Manager",
        department: "Product",
        joiningDate: new Date("2023-03-01"),
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Robert Brown",
        email: "robert.brown@company.com",
        role: "Data Analyst",
        department: "Analytics",
        joiningDate: new Date("2023-09-01"),
        status: "active",
        createdBy: adminUser._id,
      },
    ];

    const createdTeamMembers = await TeamMember.insertMany(teamMembers);
    console.log(`✅ Created ${createdTeamMembers.length} team members`);
    return createdTeamMembers;
  } catch (error) {
    console.error("Error seeding team members:", error);
    throw error;
  }
};

const seedProjects = async (users) => {
  try {
    console.log("📁 Creating projects...");

    const adminUser = users.find((user) => user.role === "admin");
    const managers = users.filter((user) => user.role === "manager");

    const projects = [
      {
        title: "Customer Portal Redesign",
        description:
          "Complete redesign of the customer portal with modern UI/UX, improved performance, and mobile responsiveness. This project includes user research, wireframing, development, and testing phases.",
        owner: managers[0]._id, // Sarah Johnson
      },
      {
        title: "Mobile App Development",
        description:
          "Development of a cross-platform mobile application using React Native. Features include user authentication, real-time notifications, offline support, and seamless integration with our web platform.",
        owner: managers[1]._id, // Mike Chen
      },
      {
        title: "API Gateway Implementation",
        description:
          "Implementation of a comprehensive API gateway to manage microservices communication, handle authentication, rate limiting, and provide centralized logging and monitoring capabilities.",
        owner: adminUser._id,
      },
      {
        title: "Data Analytics Dashboard",
        description:
          "Create a comprehensive analytics dashboard for business intelligence, featuring real-time data visualization, custom reporting, and predictive analytics capabilities.",
        owner: managers[0]._id, // Sarah Johnson
      },
      {
        title: "Security Audit & Compliance",
        description:
          "Comprehensive security audit of all systems, implementation of GDPR compliance measures, and establishment of security monitoring protocols.",
        owner: adminUser._id,
      },
      {
        title: "DevOps Pipeline Optimization",
        description:
          "Optimization of CI/CD pipelines, implementation of infrastructure as code, automated testing, and deployment strategies to improve development workflow.",
        owner: managers[1]._id, // Mike Chen
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);
    return createdProjects;
  } catch (error) {
    console.error("Error seeding projects:", error);
    throw error;
  }
};

const seedTasks = async (users, projects) => {
  try {
    console.log("📋 Creating tasks...");

    const managers = users.filter((user) => user.role === "manager");
    const members = users.filter(
      (user) => user.role === "member" && user.isActive
    );
    const adminUser = users.find((user) => user.role === "admin");

    // Helper function to get random date in the past or future
    const getRandomDate = (daysFromNow, variance = 10) => {
      const date = new Date();
      const randomDays =
        daysFromNow + Math.floor(Math.random() * variance) - variance / 2;
      date.setDate(date.getDate() + randomDays);
      return date;
    };

    // Helper function to get random user
    const getRandomUser = (userArray) => {
      return userArray[Math.floor(Math.random() * userArray.length)];
    };

    const tasks = [
      // Customer Portal Redesign Project
      {
        title: "User Research & Requirements Gathering",
        description:
          "Conduct comprehensive user research including surveys, interviews, and usability testing to understand current pain points and gather requirements for the new portal design.",
        assignee_id: members[3]._id, // Lisa Wang (Designer)
        project_id: projects[0]._id,
        status: "completed",
        priority: "high",
        dueDate: getRandomDate(-15),
        createdBy: managers[0]._id,
        completedAt: getRandomDate(-10),
        comments: [
          {
            author: members[3]._id,
            text: "Completed user interviews with 15 customers. Key findings: need for better navigation, faster load times, and mobile-first design.",
            timestamp: getRandomDate(-12),
          },
          {
            author: managers[0]._id,
            text: "Excellent work! The insights about mobile usage patterns are particularly valuable.",
            timestamp: getRandomDate(-11),
          },
        ],
      },
      {
        title: "Wireframe & Prototype Creation",
        description:
          "Create detailed wireframes and interactive prototypes based on user research findings. Include responsive design considerations for mobile and tablet devices.",
        assignee_id: members[3]._id, // Lisa Wang
        project_id: projects[0]._id,
        status: "in-progress",
        priority: "high",
        dueDate: getRandomDate(5),
        createdBy: managers[0]._id,
        comments: [
          {
            author: members[3]._id,
            text: "Working on high-fidelity wireframes. Should have the first iteration ready by tomorrow for review.",
            timestamp: getRandomDate(-2),
          },
        ],
      },
      {
        title: "Frontend Component Development",
        description:
          "Develop reusable React components based on approved wireframes. Implement responsive design and ensure accessibility standards compliance.",
        assignee_id: members[0]._id, // Alex Rodriguez
        project_id: projects[0]._id,
        status: "todo",
        priority: "high",
        dueDate: getRandomDate(12),
        createdBy: managers[0]._id,
      },
      {
        title: "Backend API Optimization",
        description:
          "Optimize existing APIs for better performance, implement caching strategies, and ensure proper error handling for the new portal features.",
        assignee_id: members[1]._id, // Emma Thompson
        project_id: projects[0]._id,
        status: "todo",
        priority: "medium",
        dueDate: getRandomDate(18),
        createdBy: managers[0]._id,
      },

      // Mobile App Development Project
      {
        title: "Mobile App Architecture Setup",
        description:
          "Set up the React Native project structure, configure navigation, state management, and establish development/deployment pipelines.",
        assignee_id: members[0]._id, // Alex Rodriguez
        project_id: projects[1]._id,
        status: "completed",
        priority: "high",
        dueDate: getRandomDate(-20),
        createdBy: managers[1]._id,
        completedAt: getRandomDate(-18),
        comments: [
          {
            author: members[0]._id,
            text: "Project setup complete! Used Redux Toolkit for state management and React Navigation v6. CI/CD pipeline configured with GitHub Actions.",
            timestamp: getRandomDate(-18),
          },
          {
            author: managers[1]._id,
            text: "Great choice on the tech stack. Looking forward to seeing the first features implemented.",
            timestamp: getRandomDate(-17),
          },
        ],
      },
      {
        title: "User Authentication Implementation",
        description:
          "Implement secure user authentication including login, registration, password reset, and biometric authentication for supported devices.",
        assignee_id: members[1]._id, // Emma Thompson
        project_id: projects[1]._id,
        status: "in-progress",
        priority: "high",
        dueDate: getRandomDate(3),
        createdBy: managers[1]._id,
        comments: [
          {
            author: members[1]._id,
            text: "JWT implementation is complete. Working on biometric authentication integration. iOS TouchID is working, testing FaceID next.",
            timestamp: getRandomDate(-1),
          },
          {
            author: managers[1]._id,
            text: "Perfect! Make sure to test on different device models. Security is crucial for this feature.",
            timestamp: getRandomDate(-1),
          },
        ],
      },
      {
        title: "Push Notifications Setup",
        description:
          "Configure and implement push notifications using Firebase Cloud Messaging for both iOS and Android platforms.",
        assignee_id: members[2]._id, // David Kim
        project_id: projects[1]._id,
        status: "todo",
        priority: "medium",
        dueDate: getRandomDate(10),
        createdBy: managers[1]._id,
      },

      // API Gateway Implementation Project
      {
        title: "Gateway Architecture Design",
        description:
          "Design the overall architecture for the API gateway including service discovery, load balancing, and failover strategies.",
        assignee_id: members[2]._id, // David Kim
        project_id: projects[2]._id,
        status: "completed",
        priority: "high",
        dueDate: getRandomDate(-25),
        createdBy: adminUser._id,
        completedAt: getRandomDate(-22),
      },
      {
        title: "Rate Limiting Implementation",
        description:
          "Implement rate limiting mechanisms to prevent API abuse and ensure fair usage across different client applications.",
        assignee_id: members[1]._id, // Emma Thompson
        project_id: projects[2]._id,
        status: "in-progress",
        priority: "medium",
        dueDate: getRandomDate(7),
        createdBy: adminUser._id,
        comments: [
          {
            author: members[1]._id,
            text: "Implemented sliding window rate limiting with Redis. Currently testing different threshold configurations.",
            timestamp: getRandomDate(-3),
          },
        ],
      },
      {
        title: "API Documentation & Testing",
        description:
          "Create comprehensive API documentation using OpenAPI/Swagger and implement automated testing suites for all endpoints.",
        assignee_id: members[6]._id, // Maria Garcia
        project_id: projects[2]._id,
        status: "todo",
        priority: "medium",
        dueDate: getRandomDate(15),
        createdBy: adminUser._id,
      },

      // Data Analytics Dashboard Project
      {
        title: "Data Model & Schema Design",
        description:
          "Design the data models and database schema for analytics data storage, including fact tables, dimension tables, and data relationships.",
        assignee_id: members[7]._id, // Robert Brown
        project_id: projects[3]._id,
        status: "completed",
        priority: "high",
        dueDate: getRandomDate(-30),
        createdBy: managers[0]._id,
        completedAt: getRandomDate(-25),
      },
      {
        title: "Real-time Data Pipeline",
        description:
          "Implement real-time data processing pipeline using Apache Kafka and Stream processing for live analytics updates.",
        assignee_id: members[2]._id, // David Kim
        project_id: projects[3]._id,
        status: "in-progress",
        priority: "high",
        dueDate: getRandomDate(8),
        createdBy: managers[0]._id,
        comments: [
          {
            author: members[2]._id,
            text: "Kafka cluster is set up and running. Working on the stream processing logic for user activity analytics.",
            timestamp: getRandomDate(-2),
          },
        ],
      },
      {
        title: "Dashboard UI Development",
        description:
          "Develop interactive dashboard interface with charts, graphs, and real-time data visualization components using D3.js and React.",
        assignee_id: members[0]._id, // Alex Rodriguez
        project_id: projects[3]._id,
        status: "todo",
        priority: "medium",
        dueDate: getRandomDate(20),
        createdBy: managers[0]._id,
      },

      // Security Audit & Compliance Project
      {
        title: "Security Vulnerability Assessment",
        description:
          "Conduct comprehensive security audit including penetration testing, code review, and vulnerability scanning of all systems.",
        assignee_id: members[1]._id, // Emma Thompson
        project_id: projects[4]._id,
        status: "in-progress",
        priority: "high",
        dueDate: getRandomDate(5),
        createdBy: adminUser._id,
        comments: [
          {
            author: members[1]._id,
            text: "Completed automated vulnerability scans. Found several medium-risk issues that need addressing. Starting manual code review next.",
            timestamp: getRandomDate(-1),
          },
          {
            author: adminUser._id,
            text: "Please prioritize any high-risk findings immediately. Let me know if you need additional resources.",
            timestamp: getRandomDate(-1),
          },
        ],
      },
      {
        title: "GDPR Compliance Implementation",
        description:
          "Implement GDPR compliance measures including data encryption, user consent management, and data deletion capabilities.",
        assignee_id: members[6]._id, // Maria Garcia
        project_id: projects[4]._id,
        status: "todo",
        priority: "high",
        dueDate: getRandomDate(12),
        createdBy: adminUser._id,
      },

      // DevOps Pipeline Optimization Project
      {
        title: "CI/CD Pipeline Redesign",
        description:
          "Redesign existing CI/CD pipelines for improved performance, reliability, and security using GitHub Actions and Docker.",
        assignee_id: members[2]._id, // David Kim
        project_id: projects[5]._id,
        status: "completed",
        priority: "medium",
        dueDate: getRandomDate(-10),
        createdBy: managers[1]._id,
        completedAt: getRandomDate(-5),
        comments: [
          {
            author: members[2]._id,
            text: "New CI/CD pipeline is live! Build times reduced by 40% and added comprehensive testing stages.",
            timestamp: getRandomDate(-5),
          },
          {
            author: managers[1]._id,
            text: "Excellent improvement! The faster builds will significantly boost team productivity.",
            timestamp: getRandomDate(-4),
          },
        ],
      },
      {
        title: "Infrastructure as Code Setup",
        description:
          "Implement Infrastructure as Code using Terraform for AWS resources management and environment provisioning.",
        assignee_id: members[2]._id, // David Kim
        project_id: projects[5]._id,
        status: "in-progress",
        priority: "medium",
        dueDate: getRandomDate(14),
        createdBy: managers[1]._id,
      },

      // Additional standalone tasks
      {
        title: "Database Performance Optimization",
        description:
          "Analyze and optimize database queries, implement proper indexing, and set up monitoring for database performance metrics.",
        assignee_id: members[1]._id, // Emma Thompson
        project_id: null, // No project assigned
        status: "todo",
        priority: "medium",
        dueDate: getRandomDate(21),
        createdBy: adminUser._id,
      },
      {
        title: "Team Onboarding Documentation",
        description:
          "Create comprehensive onboarding documentation for new team members including setup guides, coding standards, and workflow documentation.",
        assignee_id: members[6]._id, // Maria Garcia
        project_id: null,
        status: "in-progress",
        priority: "low",
        dueDate: getRandomDate(25),
        createdBy: managers[0]._id,
        comments: [
          {
            author: members[6]._id,
            text: "Working on the development environment setup guide. Should have the first draft ready by Friday.",
            timestamp: getRandomDate(-3),
          },
        ],
      },
      {
        title: "Code Review Process Improvement",
        description:
          "Review and improve the current code review process, implement automated code quality checks, and create review guidelines.",
        assignee_id: members[0]._id, // Alex Rodriguez
        project_id: null,
        status: "todo",
        priority: "low",
        dueDate: getRandomDate(30),
        createdBy: adminUser._id,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);
    return createdTasks;
  } catch (error) {
    console.error("Error seeding tasks:", error);
    throw error;
  }
};

const seedNotifications = async (users, tasks, projects) => {
  try {
    console.log("🔔 Creating notifications...");

    const getRandomPastDate = (days) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      return date;
    };

    const managers = users.filter((user) => user.role === "manager");
    const members = users.filter(
      (user) => user.role === "member" && user.isActive
    );
    const adminUser = users.find((user) => user.role === "admin");

    const notifications = [];

    // Task assignment notifications
    tasks.forEach((task, index) => {
      if (Math.random() > 0.3) {
        // 70% chance of notification
        const createdDate = getRandomPastDate(30);
        notifications.push({
          recipient: task.assignee_id,
          sender: task.createdBy,
          type: "task_assigned",
          title: "New Task Assigned",
          message: `You have been assigned a new task: "${task.title}"`,
          relatedTask: task._id,
          relatedProject: task.project_id,
          isRead: Math.random() > 0.4, // 60% chance of being read
          readAt: Math.random() > 0.4 ? createdDate : null,
          createdAt: createdDate,
        });
      }
    });

    // Task completion notifications
    const completedTasks = tasks.filter((task) => task.status === "completed");
    completedTasks.forEach((task) => {
      if (Math.random() > 0.2) {
        // 80% chance of notification
        const createdDate = getRandomPastDate(20);
        notifications.push({
          recipient: task.createdBy,
          sender: task.assignee_id,
          type: "task_completed",
          title: "Task Completed",
          message: `Task "${task.title}" has been marked as completed`,
          relatedTask: task._id,
          relatedProject: task.project_id,
          isRead: Math.random() > 0.3, // 70% chance of being read
          readAt: Math.random() > 0.3 ? createdDate : null,
          createdAt: createdDate,
        });
      }
    });

    // Task update notifications
    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    );
    inProgressTasks.forEach((task) => {
      if (Math.random() > 0.5) {
        // 50% chance of notification
        const createdDate = getRandomPastDate(10);
        notifications.push({
          recipient: task.createdBy,
          sender: task.assignee_id,
          type: "task_updated",
          title: "Task Status Updated",
          message: `Task "${task.title}" status has been updated to In Progress`,
          relatedTask: task._id,
          relatedProject: task.project_id,
          isRead: Math.random() > 0.5, // 50% chance of being read
          readAt: Math.random() > 0.5 ? createdDate : null,
          createdAt: createdDate,
        });
      }
    });

    // Comment notifications
    tasks.forEach((task) => {
      if (task.comments && task.comments.length > 0) {
        task.comments.forEach((comment) => {
          if (Math.random() > 0.3) {
            // 70% chance of notification
            const createdDate = new Date(comment.timestamp);
            // Notify task assignee if comment is not from them
            if (comment.author.toString() !== task.assignee_id.toString()) {
              notifications.push({
                recipient: task.assignee_id,
                sender: comment.author,
                type: "comment_added",
                title: "New Comment on Task",
                message: `New comment on "${
                  task.title
                }": "${comment.text.substring(0, 50)}..."`,
                relatedTask: task._id,
                relatedProject: task.project_id,
                isRead: Math.random() > 0.4, // 60% chance of being read
                readAt: Math.random() > 0.4 ? createdDate : null,
                createdAt: createdDate,
              });
            }
            // Also notify task creator if different from assignee and commenter
            if (
              comment.author.toString() !== task.createdBy.toString() &&
              task.assignee_id.toString() !== task.createdBy.toString()
            ) {
              notifications.push({
                recipient: task.createdBy,
                sender: comment.author,
                type: "comment_added",
                title: "New Comment on Task",
                message: `New comment on "${
                  task.title
                }": "${comment.text.substring(0, 50)}..."`,
                relatedTask: task._id,
                relatedProject: task.project_id,
                isRead: Math.random() > 0.4, // 60% chance of being read
                readAt: Math.random() > 0.4 ? createdDate : null,
                createdAt: createdDate,
              });
            }
          }
        });
      }
    });

    // Project assignment notifications
    projects.forEach((project) => {
      // Find all users assigned to tasks in this project
      const projectTasks = tasks.filter(
        (task) =>
          task.project_id &&
          task.project_id.toString() === project._id.toString()
      );
      const assignedUsers = [
        ...new Set(projectTasks.map((task) => task.assignee_id.toString())),
      ];

      assignedUsers.forEach((userId) => {
        if (Math.random() > 0.6) {
          // 40% chance of notification
          const createdDate = getRandomPastDate(25);
          notifications.push({
            recipient: new mongoose.Types.ObjectId(userId),
            sender: project.owner,
            type: "project_assigned",
            title: "Added to Project",
            message: `You have been added to project: "${project.title}"`,
            relatedProject: project._id,
            isRead: Math.random() > 0.5, // 50% chance of being read
            readAt: Math.random() > 0.5 ? createdDate : null,
            createdAt: createdDate,
          });
        }
      });
    });

    // Some task reassignment notifications
    const reassignmentTasks = tasks.slice(0, 5); // First 5 tasks
    reassignmentTasks.forEach((task) => {
      if (Math.random() > 0.7) {
        // 30% chance of reassignment notification
        const randomMember =
          members[Math.floor(Math.random() * members.length)];
        const createdDate = getRandomPastDate(15);
        notifications.push({
          recipient: randomMember._id,
          sender: task.createdBy,
          type: "task_reassigned",
          title: "Task Reassigned",
          message: `Task "${task.title}" has been reassigned to you`,
          relatedTask: task._id,
          relatedProject: task.project_id,
          isRead: Math.random() > 0.3, // 70% chance of being read
          readAt: Math.random() > 0.3 ? createdDate : null,
          createdAt: createdDate,
        });
      }
    });

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);
    return createdNotifications;
  } catch (error) {
    console.error("Error seeding notifications:", error);
    throw error;
  }
};

const seedActivityLogs = async (users, tasks, projects) => {
  try {
    console.log("📊 Creating activity logs...");

    const getRandomPastDate = (days) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      return date;
    };

    const getRandomIP = () => {
      return `192.168.1.${Math.floor(Math.random() * 200) + 1}`;
    };

    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    ];

    const getRandomUserAgent = () => {
      return userAgents[Math.floor(Math.random() * userAgents.length)];
    };

    const activityLogs = [];

    // User login activities
    users.forEach((user) => {
      const loginCount = Math.floor(Math.random() * 10) + 5; // 5-15 logins
      for (let i = 0; i < loginCount; i++) {
        const createdDate = getRandomPastDate(30);
        activityLogs.push({
          userId: user._id,
          action: "user_login",
          description: `${user.name} logged into the system`,
          entityType: "user",
          entityId: user._id,
          entityName: user.name,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            email: user.email,
            role: user.role,
            loginTime: createdDate,
          },
          createdAt: createdDate,
        });
      }
    });

    // Project creation activities
    projects.forEach((project) => {
      const createdDate = getRandomPastDate(30);
      activityLogs.push({
        userId: project.owner,
        action: "project_created",
        description: `Created project "${project.title}"`,
        entityType: "project",
        entityId: project._id,
        entityName: project.title,
        ipAddress: getRandomIP(),
        userAgent: getRandomUserAgent(),
        metadata: {
          descriptionLength: project.description.length,
          ownerName: users.find((u) => u._id.equals(project.owner))?.name,
        },
        createdAt: createdDate,
      });
    });

    // Task creation activities
    tasks.forEach((task) => {
      const createdDate = getRandomPastDate(25);
      const creator = users.find((u) => u._id.equals(task.createdBy));
      const assignee = users.find((u) => u._id.equals(task.assignee_id));

      // Task creation log
      activityLogs.push({
        userId: task.createdBy,
        action: "task_created",
        description: `Created task "${task.title}"`,
        entityType: "task",
        entityId: task._id,
        entityName: task.title,
        relatedEntityType: task.project_id ? "project" : null,
        relatedEntityId: task.project_id || null,
        relatedEntityName: task.project_id
          ? projects.find((p) => p._id.equals(task.project_id))?.title
          : null,
        ipAddress: getRandomIP(),
        userAgent: getRandomUserAgent(),
        metadata: {
          priority: task.priority,
          status: task.status,
          assigneeName: assignee?.name,
          dueDate: task.dueDate,
        },
        createdAt: createdDate,
      });

      // Task assignment log (if different from creator)
      if (!task.assignee_id.equals(task.createdBy)) {
        activityLogs.push({
          userId: task.createdBy,
          action: "task_assigned",
          description: `Assigned task "${task.title}" to ${assignee?.name}`,
          entityType: "task",
          entityId: task._id,
          entityName: task.title,
          relatedEntityType: "user",
          relatedEntityId: task.assignee_id,
          relatedEntityName: assignee?.name,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            priority: task.priority,
            assigneeName: assignee?.name,
            assigneeEmail: assignee?.email,
          },
          createdAt: createdDate,
        });
      }
    });

    // Task status change activities
    const statusChangeTasks = tasks.filter(
      (task) => task.status === "in-progress" || task.status === "completed"
    );
    statusChangeTasks.forEach((task) => {
      const assignee = users.find((u) => u._id.equals(task.assignee_id));
      const statusChangeDate = getRandomPastDate(15);

      if (task.status === "in-progress") {
        activityLogs.push({
          userId: task.assignee_id,
          action: "task_status_changed",
          description: `Changed task "${task.title}" status to In Progress`,
          entityType: "task",
          entityId: task._id,
          entityName: task.title,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            oldStatus: "todo",
            newStatus: "in-progress",
            priority: task.priority,
          },
          createdAt: statusChangeDate,
        });
      } else if (task.status === "completed") {
        // Status change to in-progress first
        const inProgressDate = new Date(statusChangeDate);
        inProgressDate.setDate(inProgressDate.getDate() - 3);
        activityLogs.push({
          userId: task.assignee_id,
          action: "task_status_changed",
          description: `Changed task "${task.title}" status to In Progress`,
          entityType: "task",
          entityId: task._id,
          entityName: task.title,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            oldStatus: "todo",
            newStatus: "in-progress",
            priority: task.priority,
          },
          createdAt: inProgressDate,
        });

        // Then completion
        activityLogs.push({
          userId: task.assignee_id,
          action: "task_completed",
          description: `Completed task "${task.title}"`,
          entityType: "task",
          entityId: task._id,
          entityName: task.title,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            completionTime: task.completedAt,
            priority: task.priority,
            timeTaken: task.completedAt
              ? Math.floor(
                  (new Date(task.completedAt) - new Date(task.createdAt)) /
                    (1000 * 60 * 60 * 24)
                )
              : null,
          },
          createdAt: task.completedAt || statusChangeDate,
        });
      }
    });

    // Task comment activities
    tasks.forEach((task) => {
      if (task.comments && task.comments.length > 0) {
        task.comments.forEach((comment) => {
          const commenter = users.find((u) => u._id.equals(comment.author));
          activityLogs.push({
            userId: comment.author,
            action: "task_commented",
            description: `Added comment on task "${task.title}"`,
            entityType: "comment",
            entityId: comment._id,
            entityName: comment.text.substring(0, 50) + "...",
            relatedEntityType: "task",
            relatedEntityId: task._id,
            relatedEntityName: task.title,
            ipAddress: getRandomIP(),
            userAgent: getRandomUserAgent(),
            metadata: {
              commentLength: comment.text.length,
              taskStatus: task.status,
              taskPriority: task.priority,
            },
            createdAt: comment.timestamp,
          });
        });
      }
    });

    // Some logout activities
    users.forEach((user) => {
      const logoutCount = Math.floor(Math.random() * 5) + 2; // 2-7 logouts
      for (let i = 0; i < logoutCount; i++) {
        const logoutDate = getRandomPastDate(30);
        activityLogs.push({
          userId: user._id,
          action: "user_logout",
          description: `${user.name} logged out of the system`,
          entityType: "user",
          entityId: user._id,
          entityName: user.name,
          ipAddress: getRandomIP(),
          userAgent: getRandomUserAgent(),
          metadata: {
            email: user.email,
            role: user.role,
            logoutTime: logoutDate,
          },
          createdAt: logoutDate,
        });
      }
    });

    const createdActivityLogs = await ActivityLog.insertMany(activityLogs);
    console.log(`✅ Created ${createdActivityLogs.length} activity logs`);
    return createdActivityLogs;
  } catch (error) {
    console.error("Error seeding activity logs:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    console.log("==========================================");

    await clearDatabase();

    const users = await seedUsers();
    const teamMembers = await seedTeamMembers(users);
    const projects = await seedProjects(users);
    const tasks = await seedTasks(users, projects);
    const notifications = await seedNotifications(users, tasks, projects);
    const activityLogs = await seedActivityLogs(users, tasks, projects);

    console.log("\n==========================================");
    console.log("🎉 Database seeding completed successfully!");
    console.log("==========================================");
    console.log("\n📊 Summary:");
    console.log(`👥 Users: ${users.length}`);
    console.log(`👥 Team Members: ${teamMembers.length}`);
    console.log(`📁 Projects: ${projects.length}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`📊 Activity Logs: ${activityLogs.length}`);

    console.log("\n🔑 Test Accounts:");
    console.log("==========================================");
    console.log("Admin: admin@company.com / password123");
    console.log("Manager: sarah.johnson@company.com / password123");
    console.log("Manager: mike.chen@company.com / password123");
    console.log("Member: alex.rodriguez@company.com / password123");
    console.log("Member: emma.thompson@company.com / password123");
    console.log("Member: david.kim@company.com / password123");
    console.log("Member: lisa.wang@company.com / password123");
    console.log("Member: maria.garcia@company.com / password123");
    console.log("Member: robert.brown@company.com / password123");
    console.log("Inactive: james.wilson@company.com / password123");
    console.log("==========================================");

    console.log("\n✨ Ready for testing and development!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log("\n📊 Database connection closed");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase, runSeeder };
