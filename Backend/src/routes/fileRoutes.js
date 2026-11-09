const express = require('express');
const { upload, uploadPdf } = require('../controllers/file.Controller');

const router = express.Router();

router.post('/upload-pdf', upload.single('pdfFile'), uploadPdf);

module.exports = router;
