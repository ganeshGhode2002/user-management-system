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
app.use('/api', uploadRoutes);
// CORS: allow frontend origin
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// serve uploads folder statically so frontend can access images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/users', userRoutes);

// health check
app.get('/', (req, res) => res.send('Server is up'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// error handler (central)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Client allowed origin: ${CLIENT_URL}`);
});
