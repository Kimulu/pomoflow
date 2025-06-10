// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user to the request object
    req.user = await User.findById(decoded.id).select("-password");
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    // If token is invalid or expired
    res.status(401).json({ msg: "Unauthorized" });
  }
};

// EXPORT THE FUNCTION DIRECTLY, NOT AS AN OBJECT PROPERTY
module.exports = protect;
