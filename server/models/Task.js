const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // This is how we link to the User model
    ref: "User", // Refers to the 'User' model
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  pomodoros: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  pomodorosCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId, // Links to a Project document
    ref: "Project", // Refers to the 'Project' model
    default: null, // Tasks can exist without a project, so it's optional
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", taskSchema);
