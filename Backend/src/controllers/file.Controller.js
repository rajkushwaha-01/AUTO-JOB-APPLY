// Polyfill Promise.withResolvers for Node.js versions < 22 (required by pdfjs-dist)
if (!Promise.withResolvers) {
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { extractResumeData } = require('../services/ai.service');
const User = require('../modules/user.model');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const getBucket = () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    const error = new Error('Database is not connected');
    error.status = 503;
    throw error;
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
};

const storePdf = (bucket, file, userId) =>
  new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { userId: String(userId) },
    });
    uploadStream.once('error', reject);
    uploadStream.once('finish', () => resolve(uploadStream.id));
    uploadStream.end(file.buffer);
  });

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
  let bucket;
  let newFileId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { text, links } = await extractPdfText(req.file.buffer);
    const resumeData = await extractResumeData(text);

    // Enrich resumeData with LinkedIn / GitHub URLs extracted from PDF annotations
    for (const link of links) {
      if (!link.url) continue;
      const profileType = getProfileType(link.url);
      if (profileType) {
        resumeData[profileType] = link.url;
      }
    }

    bucket = getBucket();
    const currentUser = await User.findById(req.userId).select('resume.pdfFileId');
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    newFileId = await storePdf(bucket, req.file, req.userId);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          resume: {
            ...resumeData,
            pdfLinks: links,
            rawText: text,
            uploadedAt: new Date(),
            pdfFileId: newFileId,
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      await bucket.delete(newFileId);
      newFileId = null;
      return res.status(404).json({ error: 'User not found' });
    }

    const previousFileId = currentUser.resume?.pdfFileId;
    if (previousFileId && String(previousFileId) !== String(newFileId)) {
      try {
        await bucket.delete(previousFileId);
      } catch (error) {
        console.error('Error deleting previous resume from MongoDB:', error);
      }
    }

    res.status(200).json({
      message: 'Resume uploaded and saved successfully',
      text,
      resumeData,
      pdfLinks: links,
      resume: updatedUser.resume
    });
  } catch (error) {
    if (bucket && newFileId) {
      try {
        await bucket.delete(newFileId);
      } catch (cleanupError) {
        console.error('Error deleting incomplete resume upload from MongoDB:', cleanupError);
      }
    }
    next(error);
  }
};

const downloadPdf = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('resume.pdfFileId');
    if (!user?.resume?.pdfFileId) {
      return res.status(404).json({ error: 'No resume PDF found' });
    }

    const bucket = getBucket();
    const file = await bucket.find({ _id: user.resume.pdfFileId }).next();
    if (!file) {
      return res.status(404).json({ error: 'Resume PDF not found in storage' });
    }

    res.set({
      'Content-Type': file.contentType || 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
    });
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.once('error', next);
    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadPdf, downloadPdf };