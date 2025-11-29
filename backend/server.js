// server.js
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config(); // Load .env

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Connect DB
connectDB(process.env.MONGO_URI);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------------------------
   CORS CONFIGURATION (FINAL + PRODUCTION READY)
------------------------------------------------------------ */

// CLIENT_URLS = "https://app1.vercel.app,https://app2.vercel.app,http://localhost:5173"
const rawOrigins = process.env.CLIENT_URLS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

console.log("🔗 Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, Postman, curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("⛔ Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed: " + origin), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// NOTE: Local uploads not used with S3. Keep only if using old local storage.
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------------------------------------------------
   ROUTES
------------------------------------------------------------ */

app.use("/api", uploadRoutes); // S3 upload route
app.use("/api/users", userRoutes); // Users CRUD

// Health check
app.get("/", (req, res) => res.send("Server is up 🚀"));

/* ------------------------------------------------------------
   404 Handler
------------------------------------------------------------ */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ------------------------------------------------------------
   ERROR HANDLER (Central)
------------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err.message || err);

  // CORS Error
  if (err.message && err.message.startsWith("CORS not allowed")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(500).json({ success: false, message: "Server error" });
});

/* ------------------------------------------------------------
   START SERVER
------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Listening for frontend origins: ${allowedOrigins.join(", ")}`);
});
