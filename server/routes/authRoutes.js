// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

// CORRECTED IMPORT FOR 'protect' middleware:
// Since authMiddleware.js now exports the 'protect' function directly,
// you should import it directly, not destructure it.
const protect = require("../middleware/authMiddleware"); // <<< CHANGE THIS LINE!

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe); // This line should now correctly receive the 'protect' function

module.exports = router;
