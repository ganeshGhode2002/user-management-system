const express = require('express');
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const router = express.Router();

console.log("📦 Upload routes loaded");

// Validate environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingEnvVars);
}

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * GET /api/upload - Test endpoint
 */
router.get('/', (req, res) => {
  console.log('🔍 GET /api/upload - Health check');
  res.json({ 
    success: true,
    message: 'Upload endpoint is working!',
    usage: 'POST /api/upload with form-data field "image"',
    maxSize: '10MB',
    allowedTypes: 'image/*',
    s3Bucket: process.env.S3_BUCKET || 'Not configured'
  });
});

/**
 * POST /api/upload - Upload single image
 */
router.post('/', upload.single('image'), async (req, res) => {
  console.log('📤 POST /api/upload - File upload request');
  
  try {
    // Check if file exists
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please select an image.' 
      });
    }

    console.log(`📁 File info: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

    // Generate unique filename
    const fileExt = path.extname(req.file.originalname) || '.jpg';
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1e9);
    const s3Key = `uploads/${timestamp}-${randomId}${fileExt}`;

    console.log(`📤 Uploading to S3: ${s3Key}`);

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        originalName: req.file.originalname,
        uploadedAt: new Date().toISOString()
      }
    };

    // Upload to S3
    const parallelUpload = new Upload({
      client: s3,
      params: uploadParams,
      queueSize: 4, // optional concurrency
      partSize: 5 * 1024 * 1024, // optional part size (5MB)
    });

    await parallelUpload.done();

    console.log(`✅ Upload successful: ${s3Key}`);

    // Success response - MUST match frontend expectation
    res.json({
      success: true,  // REQUIRED by frontend
      key: s3Key,     // REQUIRED by frontend
      message: 'Image uploaded successfully',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Handle specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      });
    }
    
    if (error.name === 'ValidationError' || error.message.includes('image')) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file type. Only images are allowed.'
      });
    }
    
    if (error.name === 'NoSuchBucket' || error.code === 'NoSuchBucket') {
      return res.status(500).json({
        success: false,
        message: 'S3 bucket not found. Check AWS configuration.'
      });
    }
    
    if (error.name === 'InvalidAccessKeyId' || error.code === 'InvalidAccessKeyId') {
      return res.status(500).json({
        success: false,
        message: 'AWS credentials invalid. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;