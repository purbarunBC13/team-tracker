const express = require("express");
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications with pagination and filtering
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    // Build query
    const query = { recipient: req.user._id };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    if (type) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .populate("sender", "name email avatar")
      .populate("relatedTask", "title status priority")
      .populate("relatedProject", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNotifications: total,
        hasNext: skip + notifications.length < total,
        hasPrev: parseInt(page) > 1,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error fetching unread count" });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a specific notification as read
// @access  Private
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid notification ID format" });
    }
    res
      .status(500)
      .json({ message: "Server error marking notification as read" });
  }
});

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all or selected notifications as read
// @access  Private
router.patch("/mark-all-read", auth, async (req, res) => {
  try {
    const { notificationIds } = req.body; // Optional array of specific notification IDs

    const result = await Notification.markMultipleAsRead(
      req.user._id,
      notificationIds || []
    );

    res.json({
      success: true,
      message:
        notificationIds && notificationIds.length > 0
          ? `${result.modifiedCount} notifications marked as read`
          : `All unread notifications marked as read (${result.modifiedCount} updated)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res
      .status(500)
      .json({ message: "Server error marking notifications as read" });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a specific notification
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid notification ID format" });
    }
    res.status(500).json({ message: "Server error deleting notification" });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all read notifications for the user
// @access  Private
router.delete("/clear-all", auth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      isRead: true,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} read notifications cleared`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ message: "Server error clearing notifications" });
  }
});

module.exports = router;
