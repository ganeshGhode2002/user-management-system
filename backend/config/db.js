const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI not provided');
    }
    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;
