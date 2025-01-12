const express = require('express');
const router = express.Router();
const {
    bookSitter,
    getBooking,
    acceptBooking,
    cancelBooking,
    deleteBooking,
    completeBooking,
} = require('../controllers/bookingController');

router.post('/create-booking', bookSitter);

router.get('/get-booking', getBooking);

router.put('/accept-booking', acceptBooking);

router.put('/cancel-booking', cancelBooking);

router.delete('/delete-booking', deleteBooking);

router.put('/complete-booking', completeBooking);

module.exports = router;