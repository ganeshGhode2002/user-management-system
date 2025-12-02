const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// S3 client (shared instance)
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Generate presigned URL for S3 object
 */
async function generatePresignedUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.warn(`⚠️ Failed to generate presigned URL for ${key}:`, error.message);
    return null;
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key) {
  try {
    if (!key || !key.startsWith('uploads/')) {
      console.log(`⚠️ Not an S3 key, skipping delete: ${key}`);
      return false;
    }
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });
    
    await s3.send(command);
    console.log(`✅ Deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete from S3 (${key}):`, error.message);
    return false;
  }
}

/**
 * Register new user
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, confirmPassword, gender = '', city = '', education = [], images = [] } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gender,
      city,
      education: Array.isArray(education) ? education : [education],
      images: Array.isArray(images) ? images.filter(img => img) : []
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Generate presigned URLs for images
    if (userResponse.images && userResponse.images.length > 0) {
      userResponse.photos = await Promise.all(
        userResponse.images.map(key => generatePresignedUrl(key))
      );
    } else {
      userResponse.photos = [];
    }

    res.status(201).json({ 
      success: true, 
      user: userResponse 
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'default-secret-key', 
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Generate presigned URLs for images
    if (userResponse.images && userResponse.images.length > 0) {
      userResponse.photos = await Promise.all(
        userResponse.images.map(key => generatePresignedUrl(key))
      );
    } else {
      userResponse.photos = [];
    }

    res.json({ 
      success: true, 
      token, 
      user: userResponse 
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    // Generate presigned URLs for all users' images
    const usersWithPhotos = await Promise.all(
      users.map(async (user) => {
        if (user.images && user.images.length > 0) {
          user.photos = await Promise.all(
            user.images.map(key => generatePresignedUrl(key))
          );
        } else {
          user.photos = [];
        }
        return user;
      })
    );

    res.json({ 
      success: true, 
      users: usersWithPhotos 
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate presigned URLs for images
    if (user.images && user.images.length > 0) {
      user.photos = await Promise.all(
        user.images.map(key => generatePresignedUrl(key))
      );
    } else {
      user.photos = [];
    }

    res.json({ 
      success: true, 
      user 
    });

  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, gender, city, education, images } = req.body;

    console.log('📤 Update request:', { id, email, images: images?.length || 0 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store old images for cleanup
    const oldImages = [...(user.images || [])];
    const newImages = Array.isArray(images) ? images.filter(img => img && img.startsWith('uploads/')) : [];

    console.log('🔄 Image update:', {
      oldCount: oldImages.length,
      newCount: newImages.length,
      oldImages,
      newImages
    });

    // Update fields
    if (email) user.email = email.toLowerCase().trim();
    if (gender) user.gender = gender;
    if (city) user.city = city;
    if (education) user.education = Array.isArray(education) ? education : [education];
    
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Update images (replace completely)
    user.images = newImages;

    // Find images to delete (in old but not in new)
    const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
    
    // Clean up orphaned S3 files
    if (imagesToDelete.length > 0) {
      console.log('🗑️ Cleaning up orphaned images:', imagesToDelete);
      await Promise.all(
        imagesToDelete.map(key => deleteFromS3(key))
      );
    }

    await user.save();

    // Prepare response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Generate presigned URLs for new images
    if (userResponse.images && userResponse.images.length > 0) {
      userResponse.photos = await Promise.all(
        userResponse.images.map(key => generatePresignedUrl(key))
      );
    } else {
      userResponse.photos = [];
    }

    console.log('✅ User updated successfully');
    res.json({ 
      success: true, 
      user: userResponse 
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user's images from S3
    if (user.images && user.images.length > 0) {
      console.log(`🗑️ Deleting ${user.images.length} images from S3 for user ${id}`);
      await Promise.all(
        user.images.map(key => deleteFromS3(key))
      );
    }

    // Delete user from database
    await User.findByIdAndDelete(id);

    console.log(`✅ User ${id} deleted successfully`);
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};