const express = require('express');
const { downloadBook, getDownloadInfo, getPreview } = require('../controllers/downloadController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/preview/:bookId', getPreview);
router.get('/:token/info', auth, getDownloadInfo);
router.get('/:token', auth, downloadBook);

module.exports = router;
