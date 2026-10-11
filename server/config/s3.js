const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION
  );
};

let s3Client = null;

const getS3Client = () => {
  if (!s3Client && isS3Configured()) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

/**
 * Upload buffer or stream to private S3 bucket
 */
const uploadToS3 = async (fileBuffer, key, contentType = 'application/pdf') => {
  const client = getS3Client();
  if (!client) {
    throw new Error('AWS S3 is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  await client.send(command);
  return {
    key,
    bucket: process.env.AWS_S3_BUCKET,
  };
};

/**
 * Generate a private pre-signed download URL for a file in S3
 * Valid for `expiresIn` seconds (default 3600 = 1 hour)
 */
const generatePresignedDownloadUrl = async (key, filename, expiresIn = 3600) => {
  const client = getS3Client();
  if (!client) {
    throw new Error('AWS S3 is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${(filename || 'download.pdf').replace(/[^a-zA-Z0-9.\-_]/g, '_')}"`,
    ResponseContentType: 'application/pdf',
  });

  return await getSignedUrl(client, command, { expiresIn });
};

/**
 * Get a readable stream from S3 (for server-side proxied streaming)
 */
const getS3Stream = async (key) => {
  const client = getS3Client();
  if (!client) {
    throw new Error('AWS S3 is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  const response = await client.send(command);
  return response.Body; // Node stream
};

/**
 * Delete an object from S3
 */
const deleteFromS3 = async (key) => {
  const client = getS3Client();
  if (!client) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  await client.send(command);
};

module.exports = {
  isS3Configured,
  getS3Client,
  uploadToS3,
  generatePresignedDownloadUrl,
  getS3Stream,
  deleteFromS3,
};
