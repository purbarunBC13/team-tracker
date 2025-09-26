const express = require("express");
const TeamMember = require("../models/TeamMember");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/team-members
// @desc    Get all team members
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status, department, role } = req.query;

    // Build query object
    const query = {};
    if (status) query.status = status;
    if (department) query.department = new RegExp(department, "i");
    if (role) query.role = new RegExp(role, "i");

    const teamMembers = await TeamMember.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Server error fetching team members" });
  }
});

// @route   GET /api/team-members/:id
// @desc    Get single team member
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ message: "Server error fetching team member" });
  }
});

// @route   POST /api/team-members
// @desc    Create team member
// @access  Private (Admin/Manager only)
router.post("/", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { name, email, role, department, joiningDate, status, avatar } =
      req.body;

    // Basic validation
    if (!name || !email || !role || !department || !joiningDate) {
      return res.status(400).json({
        message:
          "Please provide name, email, role, department, and joining date",
      });
    }

    // Check if team member with email already exists
    const existingMember = await TeamMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        message: "Team member with this email already exists",
      });
    }

    const teamMember = new TeamMember({
      name,
      email,
      role,
      department,
      joiningDate,
      status: status || "active",
      avatar,
      createdBy: req.user._id,
    });

    await teamMember.save();
    await teamMember.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ message: "Server error creating team member" });
  }
});

// @route   PUT /api/team-members/:id
// @desc    Update team member
// @access  Private (Admin/Manager only)
router.put("/:id", auth, authorize("admin", "manager"), async (req, res) => {
  try {
    const { name, email, role, department, joiningDate, status, avatar } =
      req.body;

    // Check if team member exists
    let teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== teamMember.email) {
      const existingMember = await TeamMember.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingMember) {
        return res.status(400).json({
          message: "Team member with this email already exists",
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (joiningDate) updateData.joiningDate = joiningDate;
    if (status) updateData.status = status;
    if (avatar !== undefined) updateData.avatar = avatar;

    teamMember = await TeamMember.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Team member updated successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ message: "Server error updating team member" });
  }
});

// @route   DELETE /api/team-members/:id
// @desc    Delete team member
// @access  Private (Admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Server error deleting team member" });
  }
});

// @route   GET /api/team-members/stats/overview
// @desc    Get team members statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalMembers = await TeamMember.countDocuments();
    const activeMembers = await TeamMember.countDocuments({ status: "active" });
    const inactiveMembers = await TeamMember.countDocuments({
      status: "inactive",
    });

    // Get department distribution
    const departmentStats = await TeamMember.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get role distribution
    const roleStats = await TeamMember.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        departmentStats,
        roleStats,
      },
    });
  } catch (error) {
    console.error("Error fetching team stats:", error);
    res.status(500).json({ message: "Server error fetching team statistics" });
  }
});

module.exports = router;
