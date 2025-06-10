// backend/middleware/authorizePlan.js

const User = require("../models/User"); // Make sure this path to your User model is correct

/**
 * Middleware to authorize access based on user plan.
 * @param {Array<string>} allowedPlans - An array of plan strings (e.g., ['trial', 'plus']) that are allowed to access the route.
 */
const authorizePlan = (allowedPlans) => async (req, res, next) => {
  // Ensure req.user exists (this means your authMiddleware should have run before this one)
  // req.user should ideally contain at least the user's ID from the JWT token
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({
        msg: "Authorization failed: User not authenticated or ID missing.",
      });
  }

  try {
    // Fetch the user from the database to get their most current plan status.
    // We only select the 'plan' field for efficiency.
    const user = await User.findById(req.user.id).select("plan");

    if (!user) {
      // This case should ideally not happen if authMiddleware correctly validated the token
      return res
        .status(404)
        .json({ msg: "Authorization failed: User not found." });
    }

    // Check if the user's current plan is included in the list of allowed plans for this route
    if (!allowedPlans.includes(user.plan)) {
      // Determine a specific error message based on the user's current plan
      let errorMessage =
        "Access denied. This feature requires an upgraded plan.";
      if (user.plan === "free") {
        errorMessage =
          "Access denied. You need a trial or plus plan to use this feature.";
      }
      // Note: 'guest' users wouldn't typically reach this middleware as they wouldn't have a token.

      console.log(
        `Access denied for user ID: ${req.user.id}, plan: ${
          user.plan
        }. Required plans: ${allowedPlans.join(", ")}`
      );
      return res.status(403).json({ msg: errorMessage }); // 403 Forbidden: user is authenticated but not authorized
    }

    // If the user's plan is authorized, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Error in authorizePlan middleware:", err.message);
    res.status(500).send("Server error during plan authorization check.");
  }
};

module.exports = authorizePlan;
