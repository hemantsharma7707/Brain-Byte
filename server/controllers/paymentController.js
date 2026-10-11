const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const { generateDownloadToken } = require('../utils/downloadToken');
const { sendPurchaseConfirmation } = require('../utils/email');

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // items: [{ bookId, price }]

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order.',
      });
    }

    // Verify prices from database (never trust frontend prices)
    const bookIds = items.map((item) => item.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, isAvailable: true });

    if (books.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more books are unavailable.',
      });
    }

    // Check for duplicate purchases
    const existingOrders = await Order.find({
      user: req.user._id,
      paymentStatus: 'paid',
      'items.book': { $in: bookIds },
    });

    if (existingOrders.length > 0) {
      const purchasedBookIds = new Set();
      existingOrders.forEach((order) => {
        order.items.forEach((item) => purchasedBookIds.add(item.book.toString()));
      });

      const alreadyPurchased = books.filter((b) =>
        purchasedBookIds.has(b._id.toString())
      );
      if (alreadyPurchased.length > 0) {
        return res.status(400).json({
          success: false,
          message: `You have already purchased: ${alreadyPurchased.map((b) => b.title).join(', ')}`,
        });
      }
    }

    // Calculate total from database prices
    const totalAmount = books.reduce((sum, book) => sum + book.price, 0);

    const isPlaceholderKey =
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID.includes('placeholder') ||
      process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder';

    let razorpayOrderId;
    let isSimulation = false;

    if (isPlaceholderKey) {
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      isSimulation = true;
    } else {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}_${req.user._id}`,
          notes: {
            userId: req.user._id.toString(),
          },
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (rError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Razorpay order creation failed, falling back to Sandbox simulation mode:', rError.message);
          razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          isSimulation = true;
        } else {
          throw rError;
        }
      }
    }

    // Save order in database with 'created' status
    const order = await Order.create({
      user: req.user._id,
      items: books.map((book) => ({
        book: book._id,
        title: book.title,
        price: book.price,
      })),
      totalAmount,
      razorpayOrderId,
      paymentStatus: 'created',
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        razorpayOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID, // Public key is safe to send
        isSimulation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data.',
      });
    }

    const isSimulatedOrder = razorpay_order_id.startsWith('order_sim_');

    if (!isSimulatedOrder) {
      // Step 1: Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Invalid signature.',
        });
      }

      // Step 2: Double-verify by fetching payment from Razorpay API
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({
          success: false,
          message: `Payment not captured. Current status: ${payment.status}`,
        });
      }
    }

    // Step 3: Find and update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Idempotency: if already paid, return success without re-processing
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        data: { orderId: order._id },
      });
    }

    // Step 4: Mark order as paid
    order.razorpayPaymentId = razorpay_payment_id || `pay_sim_${Date.now()}`;
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    await order.save();

    // Step 5: Update user's purchases
    await User.findByIdAndUpdate(order.user, {
      $addToSet: { purchases: order._id },
    });

    // Step 6: Increment book sales counts
    const bookUpdatePromises = order.items.map((item) =>
      Book.findByIdAndUpdate(item.book, { $inc: { totalSales: 1 } })
    );
    await Promise.all(bookUpdatePromises);

    // Step 7: Generate download tokens for each book
    const downloadTokens = await Promise.all(
      order.items.map((item) =>
        generateDownloadToken(order.user, order._id, item.book)
      )
    );

    // Step 8: Send confirmation email (non-blocking)
    const user = await User.findById(order.user);
    const downloadLinks = downloadTokens.map(
      (dt) => `${process.env.CLIENT_URL}/download/${dt.token}`
    );
    sendPurchaseConfirmation(user.email, user.name, order, downloadLinks)
      .then((sent) => {
        if (sent) {
          Order.findByIdAndUpdate(order._id, { emailSent: true }).catch(() => {});
        }
      })
      .catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        orderId: order._id,
        downloads: downloadTokens.map((dt) => ({
          bookId: dt.book,
          token: dt.token,
          expiresAt: dt.expiresAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/payment/webhook
const handleWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (!order) {
        // Unknown order — acknowledge to prevent retries
        return res.status(200).json({ received: true });
      }

      // Idempotent: skip if already processed
      if (order.paymentStatus === 'paid') {
        return res.status(200).json({ received: true });
      }

      // Mark as paid
      order.razorpayPaymentId = razorpayPaymentId;
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      await order.save();

      // Update user purchases
      await User.findByIdAndUpdate(order.user, {
        $addToSet: { purchases: order._id },
      });

      // Increment book sales
      await Promise.all(
        order.items.map((item) =>
          Book.findByIdAndUpdate(item.book, { $inc: { totalSales: 1 } })
        )
      );

      // Generate download tokens
      const downloadTokens = await Promise.all(
        order.items.map((item) =>
          generateDownloadToken(order.user, order._id, item.book)
        )
      );

      // Send email
      const user = await User.findById(order.user);
      if (user) {
        const downloadLinks = downloadTokens.map(
          (dt) => `${process.env.CLIENT_URL}/download/${dt.token}`
        );
        sendPurchaseConfirmation(user.email, user.name, order, downloadLinks).catch(() => {});
      }
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent retries on our errors
    res.status(200).json({ received: true });
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
