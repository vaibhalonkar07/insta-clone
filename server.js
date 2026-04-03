// server.js
// Main Express server entry point

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB Atlas ──────────────────────────────────────────────
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────
// Allow ALL origins (works with file:// and any localhost port)
app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (Development) ─────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Instagram Login API is running",
    timestamp: new Date().toISOString(),
    database: "MongoDB Atlas",
  });
});

// ─── Root ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Instagram Login API 🚀" });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n🚀 ══════════════════════════════════════");
  console.log(`   Instagram Login Server Running`);
  console.log(`   Port    : http://localhost:${PORT}`);
  console.log(`   Health  : http://localhost:${PORT}/api/health`);
  console.log(`   Auth    : http://localhost:${PORT}/api/auth/login`);
  console.log("   ══════════════════════════════════════\n");
});

module.exports = app;