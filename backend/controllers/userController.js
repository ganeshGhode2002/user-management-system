// // controllers/userController.js
// const path = require('path');
// const fs = require('fs');
// const bcrypt = require('bcrypt');
// const mongoose = require('mongoose');
// const User = require('../models/user.model');
// const jwt = require('jsonwebtoken');

// const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// // create S3 client (env must contain AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// async function presignKey(key, expires = 3600) {
//   const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
//   return getSignedUrl(s3, cmd, { expiresIn: expires });
// }

// async function deleteS3Key(key) {
//   try {
//     const cmd = new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
//     await s3.send(cmd);
//     return true;
//   } catch (err) {
//     console.warn('deleteS3Key warning:', err?.message || err);
//     return false;
//   }
// }

// /**
//  * Helper: attempt to unlink local file OR ignore if it's an S3 key.
//  * If the stored path looks like an S3 key (starts with uploads/), we do not unlink local FS.
//  */
// async function safeUnlink(relOrAbsPath) {
//   try {
//     // if looks like s3 key (uploads/...) don't try to unlink local file
//     if (typeof relOrAbsPath === 'string' && !relOrAbsPath.includes(path.sep) && relOrAbsPath.startsWith('uploads/')) {
//       // we expect this is an S3 key => delete from S3 instead
//       await deleteS3Key(relOrAbsPath);
//       return;
//     }

//     const basePath = path.join(__dirname, "..");
//     const filePath = path.isAbsolute(relOrAbsPath)
//       ? relOrAbsPath
//       : path.join(basePath, relOrAbsPath.replace(/^\//, ""));

//     if (fs.existsSync(filePath)) {
//       await fs.promises.unlink(filePath);
//       console.log("Deleted file:", filePath);
//     }
//   } catch (err) {
//     console.warn("safeUnlink warning:", err.message || err);
//   }
// }

// // ===== registerUser =====
// // Accepts JSON body (no file uploads here). Expected fields:
// // { email, password, confirmPassword, gender, city, education, photoKeys }
// // photoKeys: optional array of s3 keys like ["uploads/123.jpg", ...]
// const registerUser = async (req, res) => {
//   try {
//     const { email, password, confirmPassword, gender = '', city = '', education = [], photoKeys = [] } = req.body;

//     if (!email || !password || !confirmPassword) {
//       return res.status(400).json({ success: false, message: 'Email and password required' });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ success: false, message: 'Passwords do not match' });
//     }

//     const existing = await User.findOne({ email: email.toLowerCase().trim() });
//     if (existing) {
//       return res.status(400).json({ success: false, message: 'Email already registered' });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const user = new User({
//       email: email.toLowerCase().trim(),
//       password: hashed,
//       gender,
//       city,
//       education: Array.isArray(education) ? education : [education],
//       images: Array.isArray(photoKeys) ? photoKeys : []
//     });

//     await user.save();

//     const userObj = user.toObject();
//     delete userObj.password;

//     return res.status(201).json({ success: true, user: userObj });
//   } catch (err) {
//     console.error('registerUser error', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ===== loginUser =====
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ success: false, message: "Email & password required" });

//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "7d" });

//     const userObj = user.toObject();
//     delete userObj.password;

//     res.json({ success: true, token, user: userObj });
//   } catch (err) {
//     console.error('loginUser error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ===== getUsers =====
// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find().sort({ createdAt: -1 }).select('-password');
//     res.json({ success: true, users });
//   } catch (err) {
//     console.error('getUsers error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ===== getUserById =====
// // returns user + presigned image URLs in `photos`
// const getUserById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid user id' });
//     }

//     const user = await User.findById(id).select('-password').lean();
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     // generate presigned urls for images stored as keys
//     const photos = Array.isArray(user.images) && user.images.length
//       ? await Promise.all(user.images.map(k => presignKey(k).catch(e => {
//         console.warn('presignKey failed for', k, e?.message || e);
//         return null;
//       })))
//       : [];

//     const safeUser = {
//       _id: user._id,
//       email: user.email,
//       gender: user.gender,
//       city: user.city,
//       education: user.education,
//       createdAt: user.createdAt,
//       photos: photos.filter(Boolean)
//     };

//     res.json({ success: true, user: safeUser });
//   } catch (err) {
//     console.error('getUserById error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ===== updateUser =====
// // Accept JSON body with fields to update. For images, accept photoKeys array to replace OR append.
// const updateUser = async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid user id' });

//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     const { email, password, gender, city, education, photoKeys, replaceImages } = req.body;

//     if (email) user.email = email.toLowerCase().trim();
//     if (gender) user.gender = gender;
//     if (city) user.city = city;
//     if (education) user.education = Array.isArray(education) ? education : [education];

//     if (password) {
//       const hashed = await bcrypt.hash(password, 10);
//       user.password = hashed;
//     }

//     // photoKeys handling:
//     // - if replaceImages === 'true' (or boolean true), we replace user.images with provided keys
//     // - otherwise, append provided keys to existing images array
//     if (photoKeys) {
//       const keysArray = Array.isArray(photoKeys) ? photoKeys : [photoKeys];
//       if (replaceImages === 'true' || replaceImages === true) {
//         user.images = keysArray;
//       } else {
//         user.images = user.images.concat(keysArray.filter(Boolean));
//       }
//     }

//     await user.save();
//     const resp = user.toObject();
//     delete resp.password;
//     res.json({ success: true, user: resp });
//   } catch (err) {
//     console.error('updateUser error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ===== deleteUserDebug =====
// // Deletes user AND attempt to delete their S3 objects if images look like S3 keys.
// const deleteUserDebug = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid user id' });

//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     // delete images: if S3 key -> delete from S3, otherwise attempt local unlink
//     if (Array.isArray(user.images) && user.images.length) {
//       await Promise.all(user.images.map(async img => {
//         try {
//           if (typeof img === 'string' && img.startsWith('uploads/')) {
//             await deleteS3Key(img);
//           } else {
//             await safeUnlink(img);
//           }
//         } catch (e) {
//           console.warn('delete image error:', e?.message || e);
//         }
//       }));
//     }

//     await User.findByIdAndDelete(id);
//     res.json({ success: true, message: 'User deleted' });
//   } catch (err) {
//     console.error('deleteUserDebug error', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUserDebug
// };


const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// create S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function presignKey(key, expires = 3600) {
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expires });
}

async function deleteS3Key(key) {
  try {
    const cmd = new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
    await s3.send(cmd);
    console.log('✅ Deleted from S3:', key);
    return true;
  } catch (err) {
    console.warn('❌ deleteS3Key error:', err?.message || err);
    return false;
  }
}

// ===== registerUser =====
const registerUser = async (req, res) => {
  try {
    const { email, password, confirmPassword, gender = '', city = '', education = [], images = [] } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashed,
      gender,
      city,
      education: Array.isArray(education) ? education : [education],
      images: Array.isArray(images) ? images : []
    });

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    console.error('registerUser error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===== loginUser =====
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email & password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "7d" });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, token, user: userObj });
  } catch (err) {
    console.error('loginUser error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===== getUsers =====
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('getUsers error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===== getUserById =====
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // generate presigned urls for images stored as keys
    const photos = Array.isArray(user.images) && user.images.length
      ? await Promise.all(user.images.map(k => presignKey(k).catch(e => {
        console.warn('presignKey failed for', k, e?.message || e);
        return null;
      })))
      : [];

    const safeUser = {
      _id: user._id,
      email: user.email,
      gender: user.gender,
      city: user.city,
      education: user.education,
      images: user.images || [], // Keep the keys for editing
      createdAt: user.createdAt,
      photos: photos.filter(Boolean)
    };

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('getUserById error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===== updateUser ===== (FIXED VERSION)
const updateUser = async (req, res) => {
  try {
    console.log('📤 Update request body:', req.body);
    
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { email, password, gender, city, education, images } = req.body;

    // Update basic fields
    if (email) user.email = email.toLowerCase().trim();
    if (gender) user.gender = gender;
    if (city) user.city = city;
    if (education) user.education = Array.isArray(education) ? education : [education];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    // IMAGES HANDLING - REPLACE COMPLETELY
    if (images !== undefined) {
      const newImages = Array.isArray(images) ? images.filter(img => img) : [];
      const oldImages = user.images || [];
      
      console.log('🔄 Image update:');
      console.log('   Old images:', oldImages);
      console.log('   New images:', newImages);
      
      // Find images to delete (in old but not in new)
      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
      
      // Delete from S3
      if (imagesToDelete.length > 0) {
        console.log('🗑️ Images to delete from S3:', imagesToDelete);
        await Promise.all(
          imagesToDelete.map(async (imgKey) => {
            try {
              if (typeof imgKey === 'string' && imgKey.startsWith('uploads/')) {
                await deleteS3Key(imgKey);
              }
            } catch (error) {
              console.warn('Failed to delete from S3:', imgKey, error);
            }
          })
        );
      }
      
      // Update user images
      user.images = newImages;
    }

    await user.save();
    
    // Generate presigned URLs for response
    const photos = Array.isArray(user.images) && user.images.length
      ? await Promise.all(user.images.map(k => presignKey(k).catch(e => {
        console.warn('presignKey failed for', k, e?.message || e);
        return null;
      })))
      : [];

    const responseUser = user.toObject();
    delete responseUser.password;
    
    // Add photos array for frontend
    responseUser.photos = photos.filter(Boolean);
    
    console.log('✅ User updated successfully');
    res.json({ success: true, user: responseUser });
    
  } catch (err) {
    console.error('❌ updateUser error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===== deleteUser =====
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete images from S3
    if (Array.isArray(user.images) && user.images.length) {
      await Promise.all(user.images.map(async img => {
        try {
          if (typeof img === 'string' && img.startsWith('uploads/')) {
            await deleteS3Key(img);
          }
        } catch (e) {
          console.warn('delete image error:', e?.message || e);
        }
      }));
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ success: false, message: 'Server error' });
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