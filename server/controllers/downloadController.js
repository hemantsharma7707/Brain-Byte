const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const { verifyDownloadToken, checkDownloadToken } = require('../utils/downloadToken');
const { isS3Configured, getS3Stream, generatePresignedDownloadUrl } = require('../config/s3');

// @desc    Download purchased book
// @route   GET /api/download/:token
const downloadBook = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify the download token and increment download count
    const result = await verifyDownloadToken(token, req.user._id);
    if (!result.valid) {
      return res.status(403).json({
        success: false,
        message: result.message,
      });
    }

    // Get book with PDF credentials
    const book = await Book.findById(result.downloadToken.book).select(
      '+pdfFile +pdfKey +storageType'
    );
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    const safeFilename = `${book.title.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'BrainByte_Ebook'}.pdf`;

    // Handle AWS S3 Storage
    if (book.storageType === 's3' && book.pdfKey && isS3Configured()) {
      // If client requests direct S3 presigned URL redirect
      if (req.query.direct === 'true') {
        const presignedUrl = await generatePresignedDownloadUrl(book.pdfKey, safeFilename, 300);
        return res.redirect(presignedUrl);
      }

      // Default: Secure server streaming from S3 (keeps bucket completely hidden)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');

      const s3Stream = await getS3Stream(book.pdfKey);
      return s3Stream.pipe(res);
    }

    // Handle Private Local Storage
    const localRelPath = book.pdfFile || (book.pdfKey ? `uploads/pdfs/${book.pdfKey}` : null);
    if (!localRelPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF file record is missing. Please contact support.',
      });
    }

    const filePath = path.resolve(__dirname, '..', localRelPath);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on server. Please contact support.',
      });
    }

    // Set headers for secure download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get download token status and book details (without incrementing download count)
// @route   GET /api/download/:token/info
const getDownloadInfo = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Check token validity
    const result = await checkDownloadToken(token, req.user._id);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const dt = result.downloadToken;
    const remainingDownloads = Math.max(0, dt.maxDownloads - dt.downloadCount);

    res.status(200).json({
      success: true,
      data: {
        token: dt.token,
        book: {
          id: dt.book._id,
          title: dt.book.title,
          author: dt.book.author,
          coverImage: dt.book.coverImage,
          price: dt.book.price,
        },
        expiresAt: dt.expiresAt,
        downloadCount: dt.downloadCount,
        maxDownloads: dt.maxDownloads,
        remainingDownloads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book preview/sample (first N pages info)
// @route   GET /api/download/preview/:bookId
const getPreview = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        title: book.title,
        author: book.author,
        samplePages: book.samplePages,
        totalPages: book.pages,
        description: book.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadBook, getDownloadInfo, getPreview };
