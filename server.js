const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ FIX
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname)));

// Logger
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Instagram Login API is running",
  });
});

// Root → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
