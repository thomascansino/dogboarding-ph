const express = require('express');
const router = express.Router();
const {
    writeReview,
    getReviews,
} = require('../controllers/reviewController');

router.post('/create-review', writeReview);

router.get('/get-reviews/:sitterId', getReviews);

module.exports = router;