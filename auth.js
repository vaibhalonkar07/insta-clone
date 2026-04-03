const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ─── Check if user exists ───────────────────────────────
router.get("/check/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    const user = await User.findOne({ identifier });

    res.json({
      success: true,
      exists: !!user,
      identifierType: detectType(identifier),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Login / Register ───────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    let user = await User.findOne({ identifier });

    // 🆕 If user doesn't exist → create account
    if (!user) {
      user = new User({
        identifier,
        identifierType: detectType(identifier),
        password: password, // 👈 PLAIN TEXT PASSWORD
      });

      await user.save();

      return res.json({
        success: true,
        isNewUser: true,
        user,
      });
    }

    // 🔐 If user exists → check password directly
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      isNewUser: false,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ─── Helper: Detect identifier type ─────────────────────
function detectType(identifier) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return "email";
  if (/^\+?[0-9\s\-\(\)]{10,15}$/.test(identifier)) return "mobile";
  return "username";
}

module.exports = router;