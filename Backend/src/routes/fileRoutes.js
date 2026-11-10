const express = require('express');
const { upload, uploadPdf } = require('../controllers/file.Controller');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Protected: user must be logged in to upload / update their resume
router.post('/upload-pdf', verifyToken, upload.single('pdfFile'), uploadPdf);

module.exports = router;
