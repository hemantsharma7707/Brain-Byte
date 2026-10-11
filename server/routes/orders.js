const express = require('express');
const { getMyOrders, getOrder, regenerateDownloadToken } = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.post('/:orderId/download-token/:bookId', regenerateDownloadToken);

module.exports = router;
