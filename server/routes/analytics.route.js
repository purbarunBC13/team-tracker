const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Overall statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments();
    const userProjects = await Project.countDocuments({ owner: req.user._id });
    const totalTasks = await Task.countDocuments();

    // Task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    // Tasks created this month
    const tasksThisMonth = await Task.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Tasks completed this month
    const tasksCompletedThisMonth = await Task.countDocuments({
      status: "completed",
      completedAt: { $gte: startOfMonth },
    });

    // Project task distribution
    const projectStats = await Task.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $group: {
          _id: {
            projectId: "$project._id",
            projectTitle: "$project.title",
          },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $divide: ["$completedTasks", "$totalTasks"] },
            ],
          },
        },
      },
      {
        $sort: { totalTasks: -1 },
      },
    ]);

    // Recent activities (last 10 tasks created or updated)
    const recentActivities = await Task.find()
      .populate("assignee_id", "name email")
      .populate("project_id", "title")
      .populate("createdBy", "name")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProjects,
          userProjects,
          totalTasks,
          overdueTasks,
          tasksThisMonth,
          tasksCompletedThisMonth,
        },
        taskStats: taskStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        priorityStats: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        projectStats,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
});

// @route   GET /api/analytics/monthly-trends
// @desc    Get monthly task completion trends
// @access  Private
router.get("/monthly-trends", auth, async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get monthly task creation and completion data
    const monthlyTrends = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          created: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $gte: ["$completedAt", sixMonthsAgo] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Fill in missing months with zero values
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const monthData = monthlyTrends.find(
        (trend) => trend._id.year === year && trend._id.month === month
      );

      result.push({
        month: monthNames[month - 1],
        created: monthData ? monthData.created : 0,
        completed: monthData ? monthData.completed : 0,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching monthly trends:", error);
    res.status(500).json({ message: "Server error fetching monthly trends" });
  }
});

// @route   GET /api/analytics/user/:id
// @desc    Get individual user analytics
// @access  Private
router.get("/user/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's task statistics
    const userTasks = await Task.find({ assignee_id: userId })
      .populate("project_id", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const taskStats = {
      total: userTasks.length,
      completed: userTasks.filter((task) => task.status === "completed").length,
      inProgress: userTasks.filter((task) => task.status === "in-progress")
        .length,
      pending: userTasks.filter((task) => task.status === "todo").length,
      overdue: userTasks.filter(
        (task) => task.dueDate < new Date() && task.status !== "completed"
      ).length,
    };

    // Priority distribution
    const priorityDistribution = {
      high: userTasks.filter((task) => task.priority === "high").length,
      medium: userTasks.filter((task) => task.priority === "medium").length,
      low: userTasks.filter((task) => task.priority === "low").length,
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
        taskStats,
        priorityDistribution,
        recentTasks: userTasks.slice(0, 10), // Last 10 tasks
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ message: "Server error fetching user analytics" });
  }
});

module.exports = router;
