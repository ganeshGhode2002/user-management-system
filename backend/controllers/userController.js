const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');
const User = require('../models/user.model');


const uploadFolder = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB per file
});


const safeUnlink = (filepath) => {
  if (!filepath) return;
  const full = path.join(uploadFolder, path.basename(filepath));
  if (fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (e) {
      console.warn('Failed to delete file:', full, e.message);
    }
  }
};



const registerUser = async (req, res) => {

  const uploader = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]);

  uploader(req, res, async function (err) {
    try {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const { email, password, confirmPassword, gender, city } = req.body;
      let education = req.body.education || [];
      if (typeof education === 'string') {
        education = [education];
      }

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

      // hash password
      const saltRounds = 10;
      const hashed = await bcrypt.hash(password, saltRounds);

      // collect images
      const images = [];
      ['image1', 'image2', 'image3', 'image4'].forEach((field) => {
        if (req.files && req.files[field] && req.files[field][0]) {
          // store relative path so frontend can request /uploads/<filename>
          images.push(req.files[field][0].filename);
        }
      });

      const user = new User({
        email: email.toLowerCase().trim(),
        password: hashed,
        gender: gender || '',
        city: city || '',
        education,
        images
      });

      await user.save();

      // return user without password
      const userObj = user.toObject();
      delete userObj.password;

      res.status(201).json({ success: true, user: userObj });
    } catch (e) {
      console.error('registerUser error', e);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email & password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (e) {
    console.error('loginUser error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (e) {
    console.error('getUsers error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) {
    console.error('getUserById error', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const updateUser = async (req, res) => {
  const uploader = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]);

  uploader(req, res, async function (err) {
    try {
      if (err) return res.status(400).json({ success: false, message: err.message });

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // update fields if provided
      const { email, password, gender, city } = req.body;
      let education = req.body.education || [];
      if (typeof education === 'string') education = [education];

      if (email) user.email = email.toLowerCase().trim();
      if (gender) user.gender = gender;
      if (city) user.city = city;
      if (education && Array.isArray(education)) user.education = education;

      // if password update requested
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
      }

      // handle new uploaded images (replace by position if provided)
      // We'll keep the logic: push new images to array (or you can implement replace)
      // If you want replace-by-index, frontend should send a flag or same field names.
      const newImages = [];
      ['image1', 'image2', 'image3', 'image4'].forEach((field, idx) => {
        if (req.files && req.files[field] && req.files[field][0]) {
          // if user already had an image at this idx, delete old one
          if (user.images[idx]) {
            safeUnlink(user.images[idx]);
            user.images[idx] = req.files[field][0].filename;
          } else {
            user.images.push(req.files[field][0].filename);
          }
        }
      });

      await user.save();
      const resp = user.toObject();
      delete resp.password;
      res.json({ success: true, user: resp });
    } catch (e) {
      console.error('updateUser error', e);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // delete stored files
    if (user.images && user.images.length) {
      user.images.forEach((fname) => safeUnlink(fname));
    }

    await user.remove();
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    console.error('deleteUser error', e);
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
