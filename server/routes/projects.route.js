const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const { auth, authorize } = require("../middleware/auth");
const { logProjectActivity } = require("../utils/activityLogger");

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { owner } = req.query;

    // Build query object
    const query = {};
    if (owner) query.owner = owner;

    const projects = await Project.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error fetching projects" });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get project tasks count
    const tasksCount = await Task.countDocuments({ project_id: req.params.id });
    const completedTasksCount = await Task.countDocuments({
      project_id: req.params.id,
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        ...project.toJSON(),
        tasksCount,
        completedTasksCount,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error fetching project" });
  }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Private (Admin/Manager only)
router.post("/", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { title, description, owner } = req.body;

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({
        message: "Please provide title and description",
      });
    }

    const project = new Project({
      title,
      description,
      owner: owner || req.user._id, // Default to current user if no owner specified
    });

    await project.save();
    await project.populate("owner", "name email");

    // Log project creation activity
    await logProjectActivity(req.user._id, "project_created", project, req, {
      ownerName: project.owner?.name,
      descriptionLength: description.length,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error creating project" });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin/Manager or Owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, owner } = req.body;

    // Check if project exists
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user has permission to update this project
    const canUpdate =
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      project.owner.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        message:
          "You can only update projects you own or if you are admin/manager",
      });
    }

    // Update fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (owner && (req.user.role === "admin" || req.user.role === "manager")) {
      updateData.owner = owner;
    }

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("owner", "name email");

    // Log project update activity
    await logProjectActivity(req.user._id, "project_updated", project, req, {
      updatedFields: Object.keys(updateData),
      ownerName: project.owner?.name,
    });

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error updating project" });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin or Owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user has permission to delete this project
    const canDelete =
      req.user.role === "admin" ||
      project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        message: "You can only delete projects you own or if you are admin",
      });
    }

    // Check if project has tasks
    const tasksCount = await Task.countDocuments({ project_id: req.params.id });
    if (tasksCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete project that has tasks. Please delete or reassign all tasks first.",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error deleting project" });
  }
});

// @route   GET /api/projects/:id/tasks
// @desc    Get all tasks for a project
// @access  Private
router.get("/:id/tasks", auth, async (req, res) => {
  try {
    const { status, priority, assignee_id } = req.query;

    // Check if project exists
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Build query object
    const query = { project_id: req.params.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee_id) query.assignee_id = assignee_id;

    const tasks = await Task.find(query)
      .populate("assignee_id", "name email")
      .populate("createdBy", "name email")
      .populate("project_id", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      project: project.title,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ message: "Server error fetching project tasks" });
  }
});

// @route   GET /api/projects/stats/overview
// @desc    Get project statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const userProjects = await Project.countDocuments({ owner: req.user._id });

    // Get project completion stats
    const projectStats = await Project.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project_id",
          as: "tasks",
        },
      },
      {
        $addFields: {
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                cond: { $eq: ["$$this.status", "completed"] },
              },
            },
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
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerInfo",
        },
      },
      {
        $unwind: "$ownerInfo",
      },
      {
        $project: {
          title: 1,
          description: 1,
          owner: "$ownerInfo.name",
          totalTasks: 1,
          completedTasks: 1,
          completionRate: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        userProjects,
        projectStats,
      },
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    res
      .status(500)
      .json({ message: "Server error fetching project statistics" });
  }
});

module.exports = router;
