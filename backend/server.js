const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

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
   CORS CONFIGURATION
------------------------------------------------------------ */
const rawOrigins = process.env.CLIENT_URLS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

console.log("🔗 Allowed Origins:", allowedOrigins);

// Simple CORS - allow all in development, specific in production
if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("⛔ Blocked by CORS:", origin);
          callback(new Error("CORS not allowed"));
        }
      },
      credentials: true,
    })
  );
} else {
  // Development - allow all
  app.use(cors());
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

/* ------------------------------------------------------------
   ROUTES
------------------------------------------------------------ */
console.log("🔧 Mounting routes...");

// Upload routes - MUST be before user routes
app.use("/api/upload", uploadRoutes);
console.log("  ✅ Upload routes mounted at /api/upload");

// User routes
app.use("/api/users", userRoutes);
console.log("  ✅ User routes mounted at /api/users");

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "Server is up 🚀",
    endpoints: {
      upload: "POST /api/upload",
      users: "GET /api/users",
      userById: "GET /api/users/:id"
    }
  });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    uploadEndpoint: "POST /api/upload",
    userEndpoint: "/api/users",
    environment: process.env.NODE_ENV || "development",
    s3Bucket: process.env.S3_BUCKET ? "configured" : "missing"
  });
});

/* ------------------------------------------------------------
   404 Handler
------------------------------------------------------------ */
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: "Route not found",
    requested: `${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      upload: "POST /api/upload",
      users: "GET /api/users",
      getUser: "GET /api/users/:id",
      updateUser: "PUT /api/users/:id",
      deleteUser: "DELETE /api/users/:id",
      debug: "GET /api/debug"
    }
  });
});

/* ------------------------------------------------------------
   ERROR HANDLER
------------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message || err);
  
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ 
      success: false, 
      message: "CORS error: " + err.message 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message })
  });
});

/* ------------------------------------------------------------
   START SERVER
------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload: POST /api/upload`);
  console.log(`👤 Users: /api/users`);
  console.log(`🌐 CORS: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "All origins (development)"}`);
});