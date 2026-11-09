const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { extractResumeData } = require('../services/ai.service');

const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const getProfileType = (linkUrl) => {
  try {
    const url = new URL(linkUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'linkedin.com' || hostname === 'www.linkedin.com') {
      return 'linkedin';
    }
    if (hostname === 'github.com' || hostname === 'www.github.com') {
      return 'github';
    }
  } catch {
    return null;
  }

  return null;
};

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
    const links = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const annotations = await page.getAnnotations();
        links.push(
          ...annotations
            .filter((annotation) => annotation.subtype === 'Link')
            .map((annotation) => ({
              url: typeof annotation.url === 'string' ? annotation.url : null,
              hasDestination: annotation.dest != null,
            }))
        );
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

    return { text: pages.join('\n\n'), links };
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
    const { text, links } = await extractPdfText(dataBuffer);
    const resumeData = await extractResumeData(text);
    for (const link of links) {
      if (!link.url) {
        continue;
      }

      const profileType = getProfileType(link.url);
      if (profileType) {
        resumeData[profileType] = link.url;
      }
    }

    res.status(200).json({ text, resumeData, pdfLinks: links });
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