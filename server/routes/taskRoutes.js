// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController"); // Make sure this path is correct
const { protect } = require("../middleware/authMiddleware"); // Ensure this imports '{ protect }'

// @route   POST /api/tasks
// @desc    Add a new task
// @access  Private
router.post("/", protect, taskController.createTask); // Use createTask

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get("/", protect, taskController.getTasks); // Use getTasks

// @route   PUT /api/tasks/:id
// @desc    Update a task (e.g., text, pomodoros, completed status)
// @access  Private
router.put("/:id", protect, taskController.updateTask); // Use updateTask

// @route   PUT /api/tasks/:id/incrementPomodoro
// @desc    Increment pomodorosCompleted for a specific task
// @access  Private
router.put(
  "/:id/incrementPomodoro",
  protect,
  taskController.incrementTaskPomodoro
); // NEW ROUTE for incrementing

// @route   PUT /api/tasks/:id/toggleCompleted
// @desc    Toggle task completed status
// @access  Private
router.put("/:id/toggleCompleted", protect, taskController.toggleTaskCompleted); // Use toggleTaskCompleted

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", protect, taskController.deleteTask); // Use deleteTask

module.exports = router;
