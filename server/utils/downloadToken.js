const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const DownloadToken = require('../models/DownloadToken');

const generateDownloadToken = async (userId, orderId, bookId) => {
  // Generate a cryptographically strong, unpredictable token
  const token = `${uuidv4()}-${crypto.randomBytes(32).toString('hex')}`;

  const expiryHours = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY_HOURS) || 24;
  const maxDownloads = parseInt(process.env.MAX_DOWNLOADS_PER_TOKEN) || 5;

  const downloadToken = await DownloadToken.create({
    token,
    user: userId,
    order: orderId,
    book: bookId,
    expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    maxDownloads,
  });

  return downloadToken;
};

const verifyDownloadToken = async (token, userId) => {
  const downloadToken = await DownloadToken.findOne({ token });

  if (!downloadToken) {
    return { valid: false, message: 'Invalid download token.' };
  }

  if (downloadToken.isRevoked) {
    return { valid: false, message: 'This download token has been revoked.' };
  }

  if (downloadToken.expiresAt < new Date()) {
    return { valid: false, message: 'Download token has expired. Please generate a new one from your purchase history.' };
  }

  if (downloadToken.user.toString() !== userId.toString()) {
    return { valid: false, message: 'Unauthorized. This download does not belong to you.' };
  }

  if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
    return { valid: false, message: `Download limit reached (${downloadToken.maxDownloads} downloads). Please generate a new token.` };
  }

  // Increment download count
  downloadToken.downloadCount += 1;
  await downloadToken.save();

  return { valid: true, downloadToken };
};

const checkDownloadToken = async (token, userId) => {
  const downloadToken = await DownloadToken.findOne({ token }).populate(
    'book',
    'title author coverImage price'
  );

  if (!downloadToken) {
    return { valid: false, message: 'Invalid download token.' };
  }

  if (downloadToken.isRevoked) {
    return { valid: false, message: 'This download token has been revoked.' };
  }

  if (downloadToken.expiresAt < new Date()) {
    return {
      valid: false,
      message: 'Download token has expired. Please generate a new one from your purchase history.',
    };
  }

  if (userId && downloadToken.user.toString() !== userId.toString()) {
    return {
      valid: false,
      message: 'Unauthorized. This download does not belong to you.',
    };
  }

  if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
    return {
      valid: false,
      message: `Download limit reached (${downloadToken.maxDownloads} downloads). Please generate a new token from your purchase history.`,
    };
  }

  return { valid: true, downloadToken };
};

module.exports = {
  generateDownloadToken,
  verifyDownloadToken,
  checkDownloadToken,
};

