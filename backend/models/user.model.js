const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  gender: { type: String, default: '' },

  city: { type: String, default: '' },

  education: { type: [String], default: [] },

  // 🔥 Store only S3 KEYS here (example: "uploads/12345.jpg")
  images: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
