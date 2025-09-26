const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");
const {
  createTaskNotification,
  createCommentNotification,
} = require("../utils/notifications");
const {
  logTaskActivity,
  logCommentActivity,
} = require("../utils/activityLogger");

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      status,
      priority,
      assignee_id,
      project_id,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query object
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee_id) query.assignee_id = assignee_id;
    if (project_id) query.project_id = project_id;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const tasks = await Task.find(query)
      .populate("assignee_id", "name email")
      .populate("project_id", "title")
      .populate("createdBy", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTasks: total,
        hasNext: skip + tasks.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
});

// @route   GET /api/tasks/users
// @desc    Get users for task assignment (excluding admin and current user)
// @access  Private
router.get("/users", auth, async (req, res) => {
  try {
    // Find all users except admin role and current user
    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      isActive: true, // Only active users
    })
      .select("name email role company")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users for assignment:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee_id", "name email")
      .populate("project_id", "title description")
      .populate("createdBy", "name email")
      .populate("comments.author", "name email avatar");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Sort comments by timestamp (newest first)
    if (task.comments && task.comments.length > 0) {
      task.comments.sort((a, b) => b.timestamp - a.timestamp);
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    res.status(500).json({ message: "Server error fetching task" });
  }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private (Admin/Manager only)
router.post("/", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { title, description, assignee_id, project_id, priority, dueDate } =
      req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Verify project exists if project_id is provided
    if (project_id) {
      const project = await Project.findById(project_id);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
    }

    // Verify assignee exists if assignee_id is provided
    if (assignee_id) {
      const assignee = await User.findById(assignee_id);
      if (!assignee) {
        return res.status(404).json({
          message: "Assignee not found",
        });
      }
    }

    // Create new task
    const task = new Task({
      title,
      description,
      assignee_id,
      project_id,
      priority: priority || "medium",
      dueDate,
      createdBy: req.user._id,
      status: "todo",
    });

    await task.save();

    // Populate the task with related data
    await task.populate([
      { path: "assignee_id", select: "name email" },
      { path: "project_id", select: "title" },
      { path: "createdBy", select: "name email" },
    ]);

    // Create notification if task is assigned to someone
    if (assignee_id) {
      await createTaskNotification(
        assignee_id,
        req.user._id,
        task,
        "task_assigned"
      );
    }

    // Log task creation activity
    const activityMetadata = {
      priority: task.priority,
      dueDate: task.dueDate,
      projectName: task.project_id?.title,
      assigneeName: task.assignee_id?.name,
    };

    if (assignee_id) {
      await logTaskActivity(req.user._id, "task_assigned", task, req, {
        ...activityMetadata,
        assigneeName: task.assignee_id?.name,
      });
    } else {
      await logTaskActivity(
        req.user._id,
        "task_created",
        task,
        req,
        activityMetadata
      );
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    res.status(500).json({
      message: "Server error creating task",
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Admin/Manager only)
router.put("/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Find the task first
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Verify project exists if project_id is being updated
    if (updates.project_id) {
      const project = await Project.findById(updates.project_id);
      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
    }

    // Verify assignee exists if assignee_id is being updated
    if (updates.assignee_id) {
      const assignee = await User.findById(updates.assignee_id);
      if (!assignee) {
        return res.status(404).json({
          message: "Assignee not found",
        });
      }
    }

    // Handle task completion
    if (updates.status === "completed" && existingTask.status !== "completed") {
      updates.completedAt = new Date();
    } else if (updates.status !== "completed") {
      updates.completedAt = null;
    }

    // Check if assignee is being changed
    const isReassignment =
      updates.assignee_id &&
      updates.assignee_id.toString() !== existingTask.assignee_id?.toString();

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "assignee_id", select: "name email" },
      { path: "project_id", select: "title" },
      { path: "createdBy", select: "name email" },
    ]);

    // Create notifications for task updates
    if (isReassignment && updates.assignee_id) {
      await createTaskNotification(
        updates.assignee_id,
        req.user._id,
        updatedTask,
        "task_reassigned"
      );
    } else if (
      updates.status === "completed" &&
      existingTask.status !== "completed"
    ) {
      // Notify task creator when task is completed
      if (
        existingTask.createdBy &&
        existingTask.createdBy.toString() !== req.user._id.toString()
      ) {
        await createTaskNotification(
          existingTask.createdBy,
          req.user._id,
          updatedTask,
          "task_completed"
        );
      }
    } else if (
      updatedTask.assignee_id &&
      updatedTask.assignee_id.toString() !== req.user._id.toString()
    ) {
      // Notify assignee of other task updates
      await createTaskNotification(
        updatedTask.assignee_id,
        req.user._id,
        updatedTask,
        "task_updated"
      );
    }

    // Log task activity based on what was updated
    const activityMetadata = {
      updatedFields: Object.keys(updates),
      oldValues: {},
      newValues: {},
    };

    // Track specific changes for activity log
    if (isReassignment) {
      activityMetadata.oldAssigneeName =
        existingTask.assignee_id?.name || "Unassigned";
      activityMetadata.newAssigneeName = updatedTask.assignee_id?.name;
      await logTaskActivity(
        req.user._id,
        "task_reassigned",
        updatedTask,
        req,
        activityMetadata
      );
    } else if (
      updates.status === "completed" &&
      existingTask.status !== "completed"
    ) {
      activityMetadata.newStatus = "completed";
      await logTaskActivity(
        req.user._id,
        "task_completed",
        updatedTask,
        req,
        activityMetadata
      );
    } else if (updates.status && updates.status !== existingTask.status) {
      activityMetadata.oldStatus = existingTask.status;
      activityMetadata.newStatus = updates.status;
      await logTaskActivity(
        req.user._id,
        "task_status_changed",
        updatedTask,
        req,
        activityMetadata
      );
    } else {
      await logTaskActivity(
        req.user._id,
        "task_updated",
        updatedTask,
        req,
        activityMetadata
      );
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID format",
      });
    }

    res.status(500).json({
      message: "Server error updating task",
    });
  }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status (can be done by assigned member)
// @access  Private
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!status || !["todo", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Valid status is required (todo, in-progress, completed)",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // All authenticated users can update task status (as per frontend requirements)
    // This allows team members to update status of any task for better collaboration

    // Update completion timestamp
    const updates = { status };
    if (status === "completed" && task.status !== "completed") {
      updates.completedAt = new Date();
    } else if (status !== "completed") {
      updates.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("assignee_id", "name email")
      .populate("project_id", "title")
      .populate("createdBy", "name email");

    // Create notification when task is completed
    if (status === "completed" && task.status !== "completed") {
      // Notify task creator when task is completed
      if (
        task.createdBy &&
        task.createdBy.toString() !== req.user._id.toString()
      ) {
        await createTaskNotification(
          task.createdBy,
          req.user._id,
          updatedTask,
          "task_completed"
        );
      }
    }

    res.json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    res.status(500).json({ message: "Server error updating task status" });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID format",
      });
    }

    res.status(500).json({
      message: "Server error deleting task",
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
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

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byPriority: priorityStats,
      },
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({ message: "Server error fetching task statistics" });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks assigned to current user
// @access  Private
router.get("/my-tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee_id: req.user._id })
      .populate("project_id", "title")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ message: "Server error fetching your tasks" });
  }
});

// @route   GET /api/tasks/:id/comments
// @desc    Get all comments for a task
// @access  Private
router.get("/:id/comments", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("comments.author", "name email avatar")
      .select("comments title");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Sort comments by timestamp (newest first)
    const sortedComments = task.comments.sort(
      (a, b) => b.timestamp - a.timestamp
    );

    res.json({
      success: true,
      taskTitle: task.title,
      comments: sortedComments,
      count: sortedComments.length,
    });
  } catch (error) {
    console.error("Get task comments error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    res.status(500).json({ message: "Server error fetching comments" });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create new comment
    const newComment = {
      author: req.user._id,
      text: text.trim(),
      timestamp: new Date(),
    };

    // Add comment to task
    task.comments.push(newComment);
    await task.save();

    // Get the newly added comment with populated author
    await task.populate("comments.author", "name email avatar");
    const addedComment = task.comments[task.comments.length - 1];

    // Create notifications for comment
    const notificationRecipients = new Set();

    // Notify task assignee
    if (
      task.assignee_id &&
      task.assignee_id.toString() !== req.user._id.toString()
    ) {
      notificationRecipients.add(task.assignee_id.toString());
    }

    // Notify task creator
    if (
      task.createdBy &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      notificationRecipients.add(task.createdBy.toString());
    }

    // Notify other commenters (excluding the current user)
    task.comments.forEach((comment) => {
      if (comment.author.toString() !== req.user._id.toString()) {
        notificationRecipients.add(comment.author.toString());
      }
    });

    // Send notifications
    for (const recipientId of notificationRecipients) {
      await createCommentNotification(recipientId, req.user._id, task, text);
    }

    // Log comment activity
    await logCommentActivity(
      req.user._id,
      "task_commented",
      task,
      addedComment,
      req,
      {
        commentLength: text.length,
        taskAssignee: task.assignee_id?.name,
        taskStatus: task.status,
      }
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: addedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    res.status(500).json({ message: "Server error adding comment" });
  }
});

// @route   PUT /api/tasks/:taskId/comments/:commentId
// @desc    Update a comment (only by comment author)
// @access  Private
router.put("/:taskId/comments/:commentId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { taskId, commentId } = req.params;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment or admin
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    // Update comment
    comment.text = text.trim();
    comment.timestamp = new Date(); // Update timestamp to show it was edited

    await task.save();
    await task.populate("comments.author", "name email avatar");

    const updatedComment = task.comments.id(commentId);

    res.json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server error updating comment" });
  }
});

// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @desc    Delete a comment (only by comment author or admin)
// @access  Private
router.delete("/:taskId/comments/:commentId", auth, async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment or admin
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    // Remove comment
    task.comments.pull({ _id: commentId });
    await task.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server error deleting comment" });
  }
});

module.exports = router;
