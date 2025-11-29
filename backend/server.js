// server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config(); // load .env

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// connect DB
connectDB(process.env.MONGO_URI);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow frontend origin (must be before routes)
const CLIENT_URL = process.env.CLIENT_URL || process.env.CLIENT_URLS || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests
    if (!origin) return callback(null, true);
    // allow single origin string or comma-separated list
    const allowed = (process.env.CLIENT_URLS || CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    // fallback: allow if exact match to CLIENT_URL
    if (origin === CLIENT_URL) return callback(null, true);
    return callback(new Error(`CORS not allowed: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept']
}));

// If you still want to serve local uploads (not needed with S3), keep it.
// If using only S3 you can remove this line safely.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes (upload route must be registered after CORS)
app.use('/api', uploadRoutes);
app.use('/api/users', userRoutes);

// health check
app.get('/', (req, res) => res.send('Server is up'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// error handler (central)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.message ? err.message : err);
  // if CORS error created above, send a helpful message
  if (err && err.message && err.message.startsWith('CORS not allowed')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Client allowed origin(s): ${process.env.CLIENT_URLS || CLIENT_URL}`);
});
