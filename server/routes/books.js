const express = require('express');
const { getBooks, getBook, getCategories } = require('../controllers/bookController');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getBooks);
router.get('/:id', getBook);

module.exports = router;
