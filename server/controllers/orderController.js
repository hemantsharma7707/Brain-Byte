const Order = require('../models/Order');
const { generateDownloadToken } = require('../utils/downloadToken');
const DownloadToken = require('../models/DownloadToken');

// @desc    Get user's purchase history
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      paymentStatus: 'paid',
    })
      .populate('items.book', 'title author coverImage')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title author coverImage');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate new download token for a purchased book
// @route   POST /api/orders/:orderId/download-token/:bookId
const regenerateDownloadToken = async (req, res, next) => {
  try {
    const { orderId, bookId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized.',
      });
    }

    // Verify payment
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed for this order.',
      });
    }

    // Verify book is in order
    const orderItem = order.items.find(
      (item) => item.book.toString() === bookId
    );
    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'This book is not part of this order.',
      });
    }

    // Revoke existing tokens for this book+order combo
    await DownloadToken.updateMany(
      { user: req.user._id, order: orderId, book: bookId, isRevoked: false },
      { isRevoked: true }
    );

    // Generate new token
    const downloadToken = await generateDownloadToken(
      req.user._id,
      orderId,
      bookId
    );

    res.status(200).json({
      success: true,
      data: {
        token: downloadToken.token,
        expiresAt: downloadToken.expiresAt,
        downloadUrl: `${process.env.CLIENT_URL}/download/${downloadToken.token}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyOrders, getOrder, regenerateDownloadToken };
