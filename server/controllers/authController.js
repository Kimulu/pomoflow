// controllers/authController.js (or wherever you prefer to place it)

const User = require("../models/User"); // Ensure this path is correct for your project
const bcrypt = require("bcryptjs"); // You might not need bcryptjs directly here if using pre-save hook
const jwt = require("jsonwebtoken");

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // 1. Check if user with that email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    // 2. Check if user with that username already exists
    user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this username already exists" });
    }

    // 3. Create new user instance (password will be hashed by pre-save hook)
    user = new User({
      email,
      username,
      password, // <-- PASS THE PLAIN PASSWORD HERE, pre-save hook hashes it
      plan: "trial",
      trialStart: new Date(),
      cycles: 0, // Initialize cycles for new users
      lastPomodoroDate: null, // Initialize lastPomodoroDate for new users
    });

    // 4. Save user to database (pre-save hook will hash password)
    await user.save();

    // 5. Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 6. Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Return success response with user data (excluding password) - MODIFIED HERE
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username, // Include username
      plan: user.plan, // Include plan
      trialStart: user.trialStart, // Include trialStart
      cycles: user.cycles,
      lastPomodoroDate: user.lastPomodoroDate,
      tasks: user.tasks || [], // Include tasks, default to empty array
      msg: "User registered and logged in successfully", // Optional success message
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).send("Server error during registration");
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  const { email, password, username } = req.body; // Accept email OR username

  try {
    let user;
    // 1. Find user by email or username
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username }); // Allow login by username
    } else {
      return res.status(400).json({ msg: "Please provide email or username." });
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 2. Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Return success response with user data (excluding password) - MODIFIED HERE
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username, // Include username
      plan: user.plan, // Include plan
      trialStart: user.trialStart, // Include trialStart
      cycles: user.cycles,
      lastPomodoroDate: user.lastPomodoroDate,
      tasks: user.tasks || [], // Include tasks, default to empty array
      msg: "Logged in successfully", // Optional success message
    });
  } catch (err) {
    console.error("Login error:", err.message); // Log the actual error for debugging
    res.status(500).send("Server error during login");
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user / Clear cookie
// @access  Public
exports.logout = (req, res) => {
  // Clear the token cookie
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({ msg: "Logged out successfully" });
};

// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private (requires token in cookie)
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware after token verification
    // This removes the need for manual token handling inside this function.
    const user = await User.findById(req.user.id).select("-password"); // Don't send the password hash

    if (!user) {
      // While protect middleware usually handles unauthorized, this is a fallback
      return res.status(404).json({ msg: "User not found" });
    }

    // Return the user object with the specific fields the frontend expects
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username, // Ensure username is included
      plan: user.plan, // Ensure plan is included
      trialStart: user.trialStart, // Ensure trialStart is included
      cycles: user.cycles,
      lastPomodoroDate: user.lastPomodoroDate,
      tasks: user.tasks, // Ensure tasks are included
    });
  } catch (err) {
    // This catch block would primarily catch database errors, as token errors
    // are usually handled by the protect middleware before reaching here.
    console.error("Get user data error:", err.message);
    res.status(500).send("Server error fetching user data");
  }
};
