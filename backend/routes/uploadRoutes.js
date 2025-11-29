// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const router = express.Router();

// multer memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.post('/uploads', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname) || '';
    const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read' // public so frontend can load image directly
    };

    const parallelUpload = new Upload({ client: s3, params: uploadParams });
    await parallelUpload.done();

    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return res.json({ url, key });
  } catch (err) {
    console.error('S3 upload error', err);
    return res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

module.exports = router;
