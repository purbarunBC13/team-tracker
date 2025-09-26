const express = require("express");
const ActivityLog = require("../models/ActivityLog");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/activity-logs
// @desc    Get activity logs with filtering and pagination (admin only)
// @access  Private (Admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      userId,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      skip,
      action,
      entityType,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    let activities;
    let total;

    if (userId) {
      // Get specific user's activity
      activities = await ActivityLog.getUserActivity(userId, options);
      const countQuery = { userId };
      if (action) countQuery.action = action;
      if (entityType) countQuery.entityType = entityType;
      if (startDate || endDate) {
        countQuery.createdAt = {};
        if (startDate) countQuery.createdAt.$gte = new Date(startDate);
        if (endDate) countQuery.createdAt.$lte = new Date(endDate);
      }
      total = await ActivityLog.countDocuments(countQuery);
    } else {
      // Get system activity
      activities = await ActivityLog.getSystemActivity(options);
      const countQuery = {};
      if (action) countQuery.action = action;
      if (entityType) countQuery.entityType = entityType;
      if (startDate || endDate) {
        countQuery.createdAt = {};
        if (startDate) countQuery.createdAt.$gte = new Date(startDate);
        if (endDate) countQuery.createdAt.$lte = new Date(endDate);
      }
      total = await ActivityLog.countDocuments(countQuery);
    }

    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalActivities: total,
        hasNext: skip + activities.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({ message: "Server error fetching activity logs" });
  }
});

// @route   GET /api/activity-logs/my-activity
// @desc    Get current user's activity logs
// @access  Private
router.get("/my-activity", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      skip,
      action,
      entityType,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    const activities = await ActivityLog.getUserActivity(req.user._id, options);

    const countQuery = { userId: req.user._id };
    if (action) countQuery.action = action;
    if (entityType) countQuery.entityType = entityType;
    if (startDate || endDate) {
      countQuery.createdAt = {};
      if (startDate) countQuery.createdAt.$gte = new Date(startDate);
      if (endDate) countQuery.createdAt.$lte = new Date(endDate);
    }
    const total = await ActivityLog.countDocuments(countQuery);

    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalActivities: total,
        hasNext: skip + activities.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get my activity error:", error);
    res.status(500).json({ message: "Server error fetching your activity" });
  }
});

// @route   GET /api/activity-logs/stats
// @desc    Get activity statistics (admin only)
// @access  Private (Admin only)
router.get("/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "action" } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      groupBy,
    };

    const stats = await ActivityLog.getActivityStats(options);

    // Get additional statistics
    const totalActivities = await ActivityLog.countDocuments(
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) }),
            },
          }
        : {}
    );

    const uniqueUsers = await ActivityLog.distinct(
      "userId",
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { $gte: new Date(startDate) }),
              ...(endDate && { $lte: new Date(endDate) }),
            },
          }
        : {}
    );

    res.json({
      success: true,
      stats,
      summary: {
        totalActivities,
        uniqueUsers: uniqueUsers.length,
        groupedBy: groupBy,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error("Get activity stats error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching activity statistics" });
  }
});

// @route   GET /api/activity-logs/recent
// @desc    Get recent system activity (last 24 hours) (admin/manager only)
// @access  Private (Admin/Manager only)
router.get("/recent", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivities = await ActivityLog.getSystemActivity({
      limit: parseInt(limit),
      startDate: yesterday,
    });

    res.json({
      success: true,
      activities: recentActivities,
      count: recentActivities.length,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({ message: "Server error fetching recent activity" });
  }
});

// @route   DELETE /api/activity-logs/cleanup
// @desc    Clean up old activity logs (admin only)
// @access  Private (Admin only)
router.delete("/cleanup", auth, authorize("admin"), async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysToKeep));

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.json({
      success: true,
      message: `Cleaned up activity logs older than ${daysToKeep} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup activity logs error:", error);
    res.status(500).json({ message: "Server error cleaning up activity logs" });
  }
});

module.exports = router;
