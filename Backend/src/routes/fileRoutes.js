const express = require('express');
const { upload, uploadPdf, downloadPdf } = require('../controllers/file.Controller');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Protected: user must be logged in to upload / update their resume
router.post('/upload-pdf', verifyToken, upload.single('pdfFile'), uploadPdf);
router.get('/resume-pdf', verifyToken, downloadPdf);

module.exports = router;
