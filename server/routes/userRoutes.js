// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Adjust path if needed
const { protect } = require("../middleware/authMiddleware"); // Adjust path if needed

// @route   PUT /api/users/cycles/increment
// @desc    Increment user's daily pomodoro cycles
// @access  Private
router.put("/cycles/increment", protect, userController.incrementUserCycles);

// You might have other user routes here, e.g., router.get('/profile', protect, userController.getUserProfile);
// If you don't have this file, this would be the start of it.

module.exports = router;
