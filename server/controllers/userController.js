// controllers/userController.js

const User = require("../models/User"); // Make sure this path is correct

// @desc    Increment user's daily pomodoro cycles
// @route   PUT /api/users/cycles/increment
// @access  Private (requires authentication)
exports.incrementUserCycles = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware, which authenticates the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const now = new Date();
    const lastPomodoroDate = user.lastPomodoroDate;

    // Check if it's a new day since the last pomodoro was completed
    // Compare year, month, and day to ensure it's a new calendar day
    if (
      lastPomodoroDate &&
      (lastPomodoroDate.getFullYear() !== now.getFullYear() ||
        lastPomodoroDate.getMonth() !== now.getMonth() ||
        lastPomodoroDate.getDate() !== now.getDate())
    ) {
      // It's a new day, reset cycles
      user.cycles = 1; // Start from 1 for the first pomodoro of the new day
    } else {
      // Same day, just increment
      user.cycles += 1;
    }

    user.lastPomodoroDate = now; // Update last pomodoro date to now
    await user.save();

    // Return the updated cycles count
    res.json({ cycles: user.cycles });
  } catch (err) {
    console.error("Error incrementing user cycles:", err.message);
    res.status(500).send("Server error incrementing cycles");
  }
};

// You might have other user controller functions here, e.g., exports.getUserProfile
// If you don't have this file, this would be the start of it.
