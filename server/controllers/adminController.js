const Book = require('../models/Book');
const Order = require('../models/Order');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isS3Configured, uploadToS3, deleteFromS3 } = require('../config/s3');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalBooks, totalOrders, totalUsers, revenueResult] =
      await Promise.all([
        Book.countDocuments(),
        Order.countDocuments({ paymentStatus: 'paid' }),
        User.countDocuments({ role: 'user' }),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent orders
    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .populate('user', 'name email')
      .populate('items.book', 'title')
      .sort('-createdAt')
      .limit(10);

    // Top selling books
    const topBooks = await Book.find()
      .sort('-totalSales')
      .limit(5)
      .select('title author coverImage totalSales price');

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        topBooks,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create book (admin)
// @route   POST /api/admin/books
const createBook = async (req, res, next) => {
  try {
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      isbn: req.body.isbn,
      pages: req.body.pages ? parseInt(req.body.pages) : undefined,
      language: req.body.language || 'English',
      publishedDate: req.body.publishedDate,
      samplePages: req.body.samplePages ? parseInt(req.body.samplePages) : 10,
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
      isAvailable: req.body.isAvailable === 'false' || req.body.isAvailable === false ? false : true,
    };

    if (req.files?.coverImage) {
      bookData.coverImage = `uploads/covers/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.pdfFile) {
      const pdfFile = req.files.pdfFile[0];
      bookData.fileSize = pdfFile.size;
      bookData.mimeType = pdfFile.mimetype;

      if (isS3Configured()) {
        try {
          const s3Key = `books/pdfs/${uuidv4()}.pdf`;
          const fileBuffer = fs.readFileSync(pdfFile.path);
          await uploadToS3(fileBuffer, s3Key, pdfFile.mimetype);
          bookData.storageType = 's3';
          bookData.pdfKey = s3Key;
          // Clean up local temp upload
          if (fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
        } catch (s3Err) {
          console.error('S3 upload failed, falling back to secure local storage:', s3Err);
          bookData.storageType = 'local';
          bookData.pdfFile = `uploads/pdfs/${pdfFile.filename}`;
          bookData.pdfKey = pdfFile.filename;
        }
      } else {
        bookData.storageType = 'local';
        bookData.pdfFile = `uploads/pdfs/${pdfFile.filename}`;
        bookData.pdfKey = pdfFile.filename;
      }
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book (admin)
// @route   PUT /api/admin/books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('+pdfFile +pdfKey');
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Update fields with proper type conversions
    const fields = [
      'title', 'author', 'description', 'price', 'category',
      'isbn', 'pages', 'language', 'publishedDate', 'samplePages', 'isAvailable',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'price') {
          book.price = parseFloat(req.body.price);
        } else if (field === 'pages') {
          book.pages = req.body.pages ? parseInt(req.body.pages) : undefined;
        } else if (field === 'samplePages') {
          book.samplePages = req.body.samplePages ? parseInt(req.body.samplePages) : 10;
        } else if (field === 'isAvailable') {
          book.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
        } else {
          book[field] = req.body[field];
        }
      }
    });

    if (req.body.tags) {
      book.tags = req.body.tags.split(',').map((t) => t.trim());
    }

    // Handle file uploads
    if (req.files?.coverImage) {
      // Delete old cover
      if (book.coverImage) {
        const oldPath = path.resolve(__dirname, '..', book.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      book.coverImage = `uploads/covers/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.pdfFile) {
      const pdfFile = req.files.pdfFile[0];

      // Delete old PDF
      if (book.storageType === 's3' && book.pdfKey) {
        await deleteFromS3(book.pdfKey).catch(() => {});
      } else if (book.pdfFile) {
        const oldPath = path.resolve(__dirname, '..', book.pdfFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      book.fileSize = pdfFile.size;
      book.mimeType = pdfFile.mimetype;

      if (isS3Configured()) {
        try {
          const s3Key = `books/pdfs/${uuidv4()}.pdf`;
          const fileBuffer = fs.readFileSync(pdfFile.path);
          await uploadToS3(fileBuffer, s3Key, pdfFile.mimetype);
          book.storageType = 's3';
          book.pdfKey = s3Key;
          book.pdfFile = undefined;
          if (fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
        } catch (s3Err) {
          console.error('S3 upload failed, falling back to secure local storage:', s3Err);
          book.storageType = 'local';
          book.pdfFile = `uploads/pdfs/${pdfFile.filename}`;
          book.pdfKey = pdfFile.filename;
        }
      } else {
        book.storageType = 'local';
        book.pdfFile = `uploads/pdfs/${pdfFile.filename}`;
        book.pdfKey = pdfFile.filename;
      }
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book (admin)
// @route   DELETE /api/admin/books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('+pdfFile +pdfKey');
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Delete associated files
    if (book.coverImage) {
      const coverPath = path.resolve(__dirname, '..', book.coverImage);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    if (book.storageType === 's3' && book.pdfKey) {
      await deleteFromS3(book.pdfKey).catch(() => {});
    } else if (book.pdfFile) {
      const pdfPath = path.resolve(__dirname, '..', book.pdfFile);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.paymentStatus = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.book', 'title')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all books (admin - includes unavailable)
// @route   GET /api/admin/books
const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createBook,
  updateBook,
  deleteBook,
  getAllOrders,
  getAllBooks,
};
