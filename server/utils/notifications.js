const Notification = require("../models/Notification");

/**
 * Create a notification for task assignment
 * @param {ObjectId} recipientId - User who receives the notification
 * @param {ObjectId} senderId - User who triggered the notification
 * @param {Object} task - The task object
 * @param {string} type - Type of notification
 */
const createTaskNotification = async (
  recipientId,
  senderId,
  task,
  type = "task_assigned"
) => {
  try {
    // Don't create notification if sender and recipient are the same
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    let title, message;

    switch (type) {
      case "task_assigned":
        title = "New Task Assigned";
        message = `You have been assigned a new task: "${task.title}"`;
        break;
      case "task_updated":
        title = "Task Updated";
        message = `Task "${task.title}" has been updated`;
        break;
      case "task_completed":
        title = "Task Completed";
        message = `Task "${task.title}" has been marked as completed`;
        break;
      case "task_reassigned":
        title = "Task Reassigned";
        message = `You have been assigned to task: "${task.title}"`;
        break;
      default:
        title = "Task Notification";
        message = `Task "${task.title}" has been updated`;
    }

    const notificationData = {
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedTask: task._id,
      relatedProject: task.project_id || null,
    };

    const notification = await Notification.createNotification(
      notificationData
    );
    return notification;
  } catch (error) {
    console.error("Error creating task notification:", error);
    // Don't throw error to avoid disrupting main task operations
    return null;
  }
};

/**
 * Create a notification for comment addition
 * @param {ObjectId} recipientId - User who receives the notification
 * @param {ObjectId} senderId - User who added the comment
 * @param {Object} task - The task object
 * @param {string} commentText - The comment text (truncated if too long)
 */
const createCommentNotification = async (
  recipientId,
  senderId,
  task,
  commentText
) => {
  try {
    // Don't create notification if sender and recipient are the same
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    const truncatedText =
      commentText.length > 50
        ? commentText.substring(0, 50) + "..."
        : commentText;

    const notificationData = {
      recipient: recipientId,
      sender: senderId,
      type: "comment_added",
      title: "New Comment on Task",
      message: `New comment on "${task.title}": "${truncatedText}"`,
      relatedTask: task._id,
      relatedProject: task.project_id || null,
    };

    const notification = await Notification.createNotification(
      notificationData
    );
    return notification;
  } catch (error) {
    console.error("Error creating comment notification:", error);
    return null;
  }
};

/**
 * Create notifications for multiple recipients
 * @param {Array} recipientIds - Array of user IDs to notify
 * @param {ObjectId} senderId - User who triggered the notification
 * @param {Object} task - The task object
 * @param {string} type - Type of notification
 */
const createMultipleTaskNotifications = async (
  recipientIds,
  senderId,
  task,
  type
) => {
  try {
    const notifications = [];

    for (const recipientId of recipientIds) {
      const notification = await createTaskNotification(
        recipientId,
        senderId,
        task,
        type
      );
      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating multiple notifications:", error);
    return [];
  }
};

module.exports = {
  createTaskNotification,
  createCommentNotification,
  createMultipleTaskNotifications,
};
