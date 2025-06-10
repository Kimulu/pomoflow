const Task = require("../models/Task"); // Import the Task model
const User = require("../models/User"); // Import the User model (if needed for user-specific logic)

// @desc    Add a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  const { text, pomodoros, projectId } = req.body; // <-- ADD projectId here

  try {
    // Ensure user is authenticated (req.user.id is set by protect middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const newTask = new Task({
      userId: req.user.id, // Link task to the authenticated user
      text,
      pomodoros: pomodoros || 1, // Default to 1 if not provided
      pomodorosCompleted: 0, // Always start at 0
      completed: false, // Always start as not completed
      projectId: projectId || null, // <-- ADD THIS LINE: Save projectId, default to null if not provided
    });

    const task = await newTask.save();
    res.status(201).json(task); // Respond with the created task
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).send("Server error creating task");
  }
};

// @desc    Get all tasks for the authenticated user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    // Find all tasks belonging to the authenticated user, sorted by creation date (or 'order' if implemented)
    const tasks = await Task.find({ userId: req.user.id }).sort({
      createdAt: -1,
    }); // Newest first
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).send("Server error fetching tasks");
  }
};

// @desc    Update a task (text, target pomodoros, completed status, completed count, projectId)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  const { id } = req.params; // Task ID from URL
  // <-- ADD projectId here:
  const { text, pomodoros, pomodorosCompleted, completed, projectId } =
    req.body; // Fields to update

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Ensure the task belongs to the authenticated user
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this task" });
    }

    // Update fields if provided in the request body
    if (text !== undefined) task.text = text;
    if (pomodoros !== undefined) task.pomodoros = pomodoros;
    if (pomodorosCompleted !== undefined)
      task.pomodorosCompleted = pomodorosCompleted;
    if (completed !== undefined) task.completed = completed;
    if (projectId !== undefined) task.projectId = projectId; // <-- ADD THIS LINE: Update projectId

    // If pomodorosCompleted reaches or exceeds pomodoros, mark as completed (optional logic)
    if (task.pomodorosCompleted >= task.pomodoros && !task.completed) {
      task.completed = true;
    }

    // Save the updated task
    await task.save();
    res.json(task); // Respond with the updated task
  } catch (err) {
    console.error("Error updating task:", err.message);
    // CastError for invalid IDs, MongooseError for other validation issues
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid task ID" });
    }
    res.status(500).send("Server error updating task");
  }
};

// @desc    Increment pomodorosCompleted for a specific task
// @route   PUT /api/tasks/:id/incrementPomodoro
// @access  Private
exports.incrementTaskPomodoro = async (req, res) => {
  const { id } = req.params; // Task ID from URL

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Ensure the task belongs to the authenticated user
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this task" });
    }

    task.pomodorosCompleted += 1;

    // If pomodorosCompleted reaches or exceeds pomodoros, mark as completed
    if (task.pomodorosCompleted >= task.pomodoros && !task.completed) {
      task.completed = true;
    }

    await task.save();
    res.json(task); // Respond with the updated task
  } catch (err) {
    console.error("Error incrementing task pomodoro:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid task ID" });
    }
    res.status(500).send("Server error incrementing task pomodoro");
  }
};

// @desc    Toggle task completed status
// @route   PUT /api/tasks/:id/toggleCompleted
// @access  Private
exports.toggleTaskCompleted = async (req, res) => {
  const { id } = req.params; // Task ID from URL

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Ensure the task belongs to the authenticated user
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this task" });
    }

    task.completed = !task.completed; // Toggle the completed status

    await task.save();
    res.json(task); // Respond with the updated task
  } catch (err) {
    console.error("Error toggling task completed status:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid task ID" });
    }
    res.status(500).send("Server error toggling task completed status");
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  const { id } = req.params; // Task ID from URL

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Ensure the task belongs to the authenticated user before deleting
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this task" });
    }

    await Task.deleteOne({ _id: id }); // Use deleteOne with a query for Mongoose 6+
    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid task ID" });
    }
    res.status(500).send("Server error deleting task");
  }
};
