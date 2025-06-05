// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Ensure bcryptjs is imported

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    plan: { type: String, enum: ["free", "trial", "plus"], default: "free" },
    trialStart: { type: Date, default: null },
    cycles: { type: Number, default: 0 }, // <-- USING YOUR EXISTING 'cycles' FIELD
    // --- NEW FIELD FOR DAILY RESET ---
    lastPomodoroDate: {
      // Stores the Date object of the last completed pomodoro
      type: Date,
      default: null, // Will be set when the first pomodoro is completed
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Remove password from JSON output
        return ret;
      },
    },
  }
);

// Hash password BEFORE saving if it has been modified (e.g., on registration or password change)
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
