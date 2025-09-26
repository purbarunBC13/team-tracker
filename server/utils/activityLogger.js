const ActivityLog = require("../models/ActivityLog");

/**
 * Log user authentication activities
 */
const logAuthActivity = async (userId, action, req = null, metadata = {}) => {
  const activityData = {
    userId,
    action,
    description: getAuthDescription(action),
    entityType: "user",
    entityId: userId,
    metadata,
  };

  if (req) {
    activityData.ipAddress = req.ip || req.connection.remoteAddress;
    activityData.userAgent = req.get("User-Agent");
  }

  return await ActivityLog.logActivity(activityData);
};

/**
 * Log project-related activities
 */
const logProjectActivity = async (
  userId,
  action,
  project,
  req = null,
  metadata = {}
) => {
  const activityData = {
    userId,
    action,
    description: getProjectDescription(action, project),
    entityType: "project",
    entityId: project._id,
    entityName: project.title,
    metadata,
  };

  if (req) {
    activityData.ipAddress = req.ip || req.connection.remoteAddress;
    activityData.userAgent = req.get("User-Agent");
  }

  return await ActivityLog.logActivity(activityData);
};

/**
 * Log task-related activities
 */
const logTaskActivity = async (
  userId,
  action,
  task,
  req = null,
  metadata = {}
) => {
  const activityData = {
    userId,
    action,
    description: getTaskDescription(action, task, metadata),
    entityType: "task",
    entityId: task._id,
    entityName: task.title,
    metadata,
  };

  // Add project information if available
  if (task.project_id) {
    activityData.relatedEntityType = "project";
    activityData.relatedEntityId = task.project_id;
    if (task.project_id.title) {
      activityData.relatedEntityName = task.project_id.title;
    }
  }

  if (req) {
    activityData.ipAddress = req.ip || req.connection.remoteAddress;
    activityData.userAgent = req.get("User-Agent");
  }

  return await ActivityLog.logActivity(activityData);
};

/**
 * Log comment-related activities
 */
const logCommentActivity = async (
  userId,
  action,
  task,
  comment,
  req = null,
  metadata = {}
) => {
  const activityData = {
    userId,
    action,
    description: getCommentDescription(action, task, comment),
    entityType: "comment",
    entityId: comment._id,
    entityName:
      comment.text.substring(0, 50) + (comment.text.length > 50 ? "..." : ""),
    relatedEntityType: "task",
    relatedEntityId: task._id,
    relatedEntityName: task.title,
    metadata,
  };

  if (req) {
    activityData.ipAddress = req.ip || req.connection.remoteAddress;
    activityData.userAgent = req.get("User-Agent");
  }

  return await ActivityLog.logActivity(activityData);
};

/**
 * Log team member activities
 */
const logTeamMemberActivity = async (
  userId,
  action,
  member,
  req = null,
  metadata = {}
) => {
  const activityData = {
    userId,
    action,
    description: getTeamMemberDescription(action, member),
    entityType: "team_member",
    entityId: member._id,
    entityName: member.name,
    metadata,
  };

  if (req) {
    activityData.ipAddress = req.ip || req.connection.remoteAddress;
    activityData.userAgent = req.get("User-Agent");
  }

  return await ActivityLog.logActivity(activityData);
};

// Helper functions for generating descriptions
function getAuthDescription(action) {
  switch (action) {
    case "user_login":
      return "User logged into the system";
    case "user_logout":
      return "User logged out of the system";
    case "user_register":
      return "New user registered in the system";
    default:
      return `User authentication: ${action}`;
  }
}

function getProjectDescription(action, project) {
  switch (action) {
    case "project_created":
      return `Created project "${project.title}"`;
    case "project_updated":
      return `Updated project "${project.title}"`;
    case "project_deleted":
      return `Deleted project "${project.title}"`;
    default:
      return `Project action: ${action} on "${project.title}"`;
  }
}

function getTaskDescription(action, task, metadata = {}) {
  switch (action) {
    case "task_created":
      return `Created task "${task.title}"`;
    case "task_updated":
      return `Updated task "${task.title}"`;
    case "task_assigned":
      return `Assigned task "${task.title}" to ${
        metadata.assigneeName || "a user"
      }`;
    case "task_reassigned":
      return `Reassigned task "${task.title}" to ${
        metadata.newAssigneeName || "a different user"
      }`;
    case "task_status_changed":
      return `Changed status of task "${task.title}" to ${
        metadata.newStatus || "unknown"
      }`;
    case "task_completed":
      return `Marked task "${task.title}" as completed`;
    case "task_deleted":
      return `Deleted task "${task.title}"`;
    default:
      return `Task action: ${action} on "${task.title}"`;
  }
}

function getCommentDescription(action, task, comment) {
  const commentPreview =
    comment.text.substring(0, 30) + (comment.text.length > 30 ? "..." : "");

  switch (action) {
    case "task_commented":
      return `Added comment on task "${task.title}": "${commentPreview}"`;
    case "comment_updated":
      return `Updated comment on task "${task.title}": "${commentPreview}"`;
    case "comment_deleted":
      return `Deleted comment on task "${task.title}"`;
    default:
      return `Comment action: ${action} on task "${task.title}"`;
  }
}

function getTeamMemberDescription(action, member) {
  switch (action) {
    case "team_member_added":
      return `Added team member "${member.name}"`;
    case "team_member_updated":
      return `Updated team member "${member.name}"`;
    case "team_member_removed":
      return `Removed team member "${member.name}"`;
    default:
      return `Team member action: ${action} on "${member.name}"`;
  }
}

module.exports = {
  logAuthActivity,
  logProjectActivity,
  logTaskActivity,
  logCommentActivity,
  logTeamMemberActivity,
};
