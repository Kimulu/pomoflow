// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController"); // Destructure getMe here

const { protect } = require("../middleware/authMiddleware"); // <-- Make sure this line exists and is correct!

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe); // <-- IMPORTANT: Add 'protect' here

module.exports = router;
