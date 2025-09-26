const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user_login",
        "user_logout",
        "user_register",
        "project_created",
        "project_updated",
        "project_deleted",
        "task_created",
        "task_updated",
        "task_assigned",
        "task_reassigned",
        "task_status_changed",
        "task_completed",
        "task_deleted",
        "task_commented",
        "comment_updated",
        "comment_deleted",
        "team_member_added",
        "team_member_updated",
        "team_member_removed",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["user", "project", "task", "comment", "team_member"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    entityName: {
      type: String,
    },
    relatedEntityType: {
      type: String,
      enum: ["user", "project", "task", "comment", "team_member"],
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedEntityName: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

// Static method to create activity log
ActivityLogSchema.statics.logActivity = async function (data) {
  try {
    const activityLog = new this(data);
    await activityLog.save();
    return activityLog;
  } catch (error) {
    console.error("Error creating activity log:", error);
    // Don't throw error to avoid disrupting main operations
    return null;
  }
};

// Static method to get user activity
ActivityLogSchema.statics.getUserActivity = async function (
  userId,
  options = {}
) {
  const {
    limit = 50,
    skip = 0,
    action,
    entityType,
    startDate,
    endDate,
  } = options;

  const query = { userId };

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get system activity
ActivityLogSchema.statics.getSystemActivity = async function (options = {}) {
  const {
    limit = 100,
    skip = 0,
    action,
    entityType,
    startDate,
    endDate,
  } = options;

  const query = {};

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.find(query)
    .populate("userId", "name email avatar role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get activity stats
ActivityLogSchema.statics.getActivityStats = async function (options = {}) {
  const {
    startDate,
    endDate,
    groupBy = "action", // action, entityType, userId
  } = options;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        latestActivity: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
