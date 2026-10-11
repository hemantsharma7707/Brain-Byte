const express = require('express');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Webhook needs raw body for signature verification — handled in server.js
router.post('/webhook', handleWebhook);

// Protected payment routes
router.post('/create-order', auth, paymentLimiter, createOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;
