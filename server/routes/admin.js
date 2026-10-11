const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const {
  getDashboardStats,
  createBook,
  updateBook,
  deleteBook,
  getAllOrders,
  getAllBooks,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, admin);

router.get('/dashboard', getDashboardStats);
router.get('/books', getAllBooks);
router.post(
  '/books',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
  ]),
  createBook
);
router.put(
  '/books/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
  ]),
  updateBook
);
router.delete('/books/:id', deleteBook);
router.get('/orders', getAllOrders);

module.exports = router;
