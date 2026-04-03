const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  identifier: String,
  identifierType: String,
  password: String, // plain text now
  fullName: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);