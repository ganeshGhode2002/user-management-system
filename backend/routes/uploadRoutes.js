// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

// multer memory storage (adjust fileSize limit if needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// create S3 client using env vars (make sure AWS_REGION is short code like "ap-south-1")
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// helper to generate presigned GET URL
async function makePresignedGetUrl(bucket, key, expiresInSeconds = 3600) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
  return url;
}

// POST /api/upload
// expects form-data with field name "image"
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname) || '';
    const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    // upload params - no ACL (works when bucket enforces ownership)
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    // use high-level Upload helper (handles multipart for large files)
    const parallelUpload = new Upload({ client: s3, params: uploadParams });
    await parallelUpload.done();

    // generate a presigned GET URL valid for 1 hour (3600s)
    const url = await makePresignedGetUrl(process.env.S3_BUCKET, key, 3600);

    // return presigned url (frontend can use it directly)
    return res.json({ url, key });
  } catch (err) {
    console.error('S3 upload error', err);
    // be slightly more verbose to help debugging
    return res.status(500).json({ error: 'Upload failed', details: err?.message || String(err) });
  }
});

module.exports = router;
