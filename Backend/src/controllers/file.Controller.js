const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { extractResumeData } = require('../services/ai.service');

const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const extractPdfText = async (dataBuffer) => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const standardFontDataUrl = `${path.join(
    path.dirname(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')),
    '../../standard_fonts'
  )
    .split(path.sep)
    .join('/')}/`;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(dataBuffer),
    standardFontDataUrl,
  });

  try {
    const pdfDocument = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const pageText = content.items
          .filter((item) => typeof item.str === 'string')
          .map((item) => `${item.str}${item.hasEOL ? '\n' : ' '}`)
          .join('')
          .trim();
        pages.push(pageText);
      } finally {
        page.cleanup();
      }
    }

    return pages.join('\n\n');
  } finally {
    await loadingTask.destroy();
  }
};

const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const text = await extractPdfText(dataBuffer);
    const resumeData = await extractResumeData(text);

    res.status(200).json({ text, resumeData });
  } catch (error) {
    next(error);
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting uploaded PDF:', unlinkErr);
        }
      });
    }
  }
};

module.exports = { upload, uploadPdf };