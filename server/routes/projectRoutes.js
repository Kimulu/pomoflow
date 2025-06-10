// backend/routes/projectRoutes.js

const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController"); // Path to your new controller
const authMiddleware = require("../middleware/authMiddleware"); // Path to your existing authentication middleware
const authorizePlan = require("../middleware/authorizePlan"); // Path to your new authorization middleware

// Define the allowed plans for accessing project management features
const PREMIUM_PLANS = ["trial", "plus"];

console.log("Type of authMiddleware:", typeof authMiddleware);
console.log("Type of authorizePlan:", typeof authorizePlan);
console.log(
  "Type of authorizePlan(PREMIUM_PLANS):",
  typeof authorizePlan(PREMIUM_PLANS)
);
console.log("Type of projectController:", typeof projectController); // Is it an object?
console.log(
  "Type of projectController.createProject:",
  typeof projectController.createProject
);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Trial/Plus users only)
router.post(
  "/",
  authMiddleware, // Ensure user is authenticated
  authorizePlan(PREMIUM_PLANS), // Ensure user has a premium plan
  projectController.createProject
);

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private (Trial/Plus users only)
router.get(
  "/",
  authMiddleware,
  authorizePlan(PREMIUM_PLANS),
  projectController.getProjects
);

// @route   PUT /api/projects/:id
// @desc    Update a specific project by ID
// @access  Private (Trial/Plus users only)
router.put(
  "/:id",
  authMiddleware,
  authorizePlan(PREMIUM_PLANS),
  projectController.updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete a specific project by ID
// @access  Private (Trial/Plus users only)
router.delete(
  "/:id",
  authMiddleware,
  authorizePlan(PREMIUM_PLANS),
  projectController.deleteProject
);

module.exports = router;
