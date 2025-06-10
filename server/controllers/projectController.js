// backend/controllers/projectController.js

const Project = require("../models/Project"); // Make sure path is correct
const Task = require("../models/Task"); // Will need this for deleting associated tasks later

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Trial/Plus)
exports.createProject = async (req, res) => {
  const { name } = req.body; // Project name from request body
  const userId = req.user.id;

  try {
    const existingProject = await Project.findOne({ name, userId });
    if (existingProject) {
      return res
        .status(400)
        .json({
          msg: "Project with this name already exists for your account.",
        });
    }

    const project = new Project({
      name,
      userId,
    });

    await project.save();
    res.status(201).json(project); // 201 Created
  } catch (err) {
    console.error("Error creating project:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send("Server error creating project");
  }
};

// @desc    Get all projects for the authenticated user
// @route   GET /api/projects
// @access  Private (Trial/Plus)
exports.getProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).send("Server error fetching projects");
  }
};

// @desc    Update a project by ID
// @route   PUT /api/projects/:id
// @access  Private (Trial/Plus)
exports.updateProject = async (req, res) => {
  const { name } = req.body;
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    let project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.userId.toString() !== userId) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this project" });
    }

    if (name && name !== project.name) {
      const existingProject = await Project.findOne({
        name,
        userId,
        _id: { $ne: projectId },
      });
      if (existingProject) {
        return res
          .status(400)
          .json({
            msg: "Another project with this name already exists for your account.",
          });
      }
    }

    project.name = name || project.name;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Error updating project:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send("Server error updating project");
  }
};

// @desc    Delete a project by ID
// @route   DELETE /api/projects/:id
// @access  Private (Trial/Plus)
exports.deleteProject = async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    let project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.userId.toString() !== userId) {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this project" });
    }

    await Task.updateMany(
      { projectId: projectId },
      { $set: { projectId: null } }
    ); // Or deleteMany if preferred
    await Project.deleteOne({ _id: projectId });

    res.json({ msg: "Project and associated tasks updated successfully" });
  } catch (err) {
    console.error("Error deleting project:", err.message);
    res.status(500).send("Server error deleting project");
  }
};

// NO "module.exports = ..." line here that exports the Project model.
// The functions are already exported via "exports.functionName = ..."
