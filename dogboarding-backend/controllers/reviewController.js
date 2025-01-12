const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const DogSitter = require('../models/dogSitterModel');

//@desc Write a review
//@route POST /api/reviews/create-review
//@access public
const writeReview = asyncHandler(async (req, res) => {
    const { clientId, sitterId, bookingId, rating, reviewText } = req.body;

    // check for required fields
    if ( !rating ) {
        res.status(400);
        throw new Error(`Please rate the sitter.`);
    };

    if ( !clientId || !sitterId || !bookingId ) {
        res.status(400);
        throw new Error(`Request body must have the ff: client id, sitter id, booking id`);
    };

    // validate rating to avoid corrupting the data of sitter
    if ( rating < 1 || rating > 5 ) {
        res.status(400);
        throw new Error(`Rating must be a number between 1 and 5.`);
    };

    // find the accepted booking only to avoid review spam
    const booking = await Booking.findOne({ clientId, sitterId, status: 'accepted' });

    if ( !booking ) {
        res.status(404);
        throw new Error(`Please complete the booking before writing a review.`);
    };

    // to avoid double reviews
    if ( booking.clientStatus === 'completed' ) {
        res.status(400);
        throw new Error(`You can only write a review once per completed booking.`);
    };

    // create new review
    const newReview = await Review.create({
        user: clientId,
        dogSitter: sitterId,
        booking: bookingId,
        rating,
        comment: reviewText,
    });

    // update the ratings and completedBookings of the dog sitter
    const sitter = await DogSitter.findById(sitterId);
    if ( sitter ) {
        sitter.completedBookings++; // increment completed bookings by 1
        sitter.ratings.totalRating += rating; // add the new rating to the total rating of the dog sitter
        sitter.ratings.numberOfRatings++; // increment number of ratings by 1

        await sitter.save();
        console.log('Updated the data of dog sitter:', sitter);
    } else {
        res.status(404);
        throw new Error(`Sitter does not exist.`);
    };

    res.status(201).json(newReview);
});

//@desc Get all reviews of the sitter
//@route GET /api/reviews/get-reviews/:sitterId?page=<pageNumber>
//@access public
const getReviews = asyncHandler(async (req, res) => {
    const { sitterId } = req.params;
    const page = parseInt(req.query.page) || 1; // current page, default to 1
    const limit = 5 // limit to 5 reviews
    const skip = (page - 1) * limit; // if page = 1, skip 0 documents; if page = 2, skip 5 documents, etc..
    
    const reviews = await Review.find({ dogSitter: sitterId })
        .sort({ createdAt: -1 }) // sort by most recent
        .skip(skip) // skip unnecessary documents
        .limit(limit) // limit to 5 reviews
        .populate('user', 'username profilePicture'); // Populate certain fields from the referenced client

    
    const totalReviews = await Review.countDocuments({ dogSitter: sitterId }); // count the no. of reviews of the dogsitter

    res.status(200).json({
        reviews,
        currentPage: page, 
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
    });
});

module.exports = {
    writeReview,
    getReviews,
};