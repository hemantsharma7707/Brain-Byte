const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Data Science',
        'AI & Machine Learning',
        'Mobile Development',
        'DevOps',
        'Cybersecurity',
        'Database',
        'Cloud Computing',
        'Software Engineering',
        'Design',
        'Business',
        'Other',
      ],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    pdfFile: {
      type: String,
      select: false, // Never expose PDF path in queries by default
    },
    pdfKey: {
      type: String,
      select: false, // Private S3 object key or private filename
    },
    storageType: {
      type: String,
      enum: ['s3', 'local'],
      default: 'local',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    samplePages: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    isbn: {
      type: String,
      trim: true,
    },
    pages: {
      type: Number,
      min: 1,
    },
    language: {
      type: String,
      default: 'English',
    },
    publishedDate: {
      type: Date,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: [String],
    totalSales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });

module.exports = mongoose.model('Book', bookSchema);
