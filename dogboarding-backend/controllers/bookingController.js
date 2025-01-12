const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Chat = require('../models/chatModel');

//@desc Create booking form 
//@route POST /api/bookings/create-booking
//@access public
const bookSitter = asyncHandler(async (req, res) => {
    // destructure necessary values
    const { 
        dogsNeededToBoard,
        breedOfDogs,
        sizeOfDogs,
        additionalDetails,
        startDate,
        startTime,
        endDate,
        endTime,
        preferredMethod,
        clientId,
        sitterId,
    } = req.body;
    
    // check required fields if complete
    if (
        !dogsNeededToBoard ||
        !sizeOfDogs.length ||
        !startDate ||
        !startTime ||
        !endDate ||
        !endTime ||
        !preferredMethod
    ) {
        res.status(400);
        throw new Error(`Fill up the necessary fields required.`);
    };

    // check if there's a sitter and client in the req.body
    if ( !clientId || !sitterId ) {
        res.status(400);
        throw new Error('There must be a client and a sitter passed in the body.');
    };
    
    // check if a non-completed booking already exists
    const existingBooking = await Booking.findOne({ clientId, sitterId, status: { $ne: 'completed' } });
    if ( existingBooking ) {
        res.status(400);
        throw new Error(`You already have an existing booking with this sitter.`);
    };

    // if not, create booking 
    // but first, format the date and time properly
    const startDateAndTime = new Date(`${startDate}T${startTime}:00Z`);
    const endDateAndTime = new Date(`${endDate}T${endTime}:00Z`);

    const newBooking = await Booking.create({
        sitterId,
        clientId,
        clientStatus: 'pending',
        sitterStatus: 'pending',
        status: 'pending',
        dogsNeededToBoard,
        breedOfDogs,
        sizeOfDogs,
        additionalDetails,
        startDateAndTime,
        endDateAndTime,
        preferredMethod,
    });

    // also update the chat document most recent booking id
    const updateChat = await Chat.findOneAndUpdate(
        { clientId, sitterId },
        { mostRecentBookingId: newBooking._id },
        { new: true }
    );

    console.log('Chat document successfully updated:', updateChat);
    console.log('Booking successfully created:', newBooking);
    
    res.status(201).json(newBooking);
});

//@desc Get booking form 
//@route GET /api/bookings/get-booking?clientId=<clientId>&sitterId=<sitterId>
//@access public
const getBooking = asyncHandler(async (req, res) => {
    const { clientId, sitterId } = req.query;

    // check if a non-completed booking already exists with the same client and sitter
    const existingBooking = await Booking.findOne({ clientId, sitterId, status: { $ne: 'completed' } });

    // if a non-completed booking does not exist, simply exit the function
    if ( !existingBooking ) {
        return;
    };

    // if a non-completed booking exists, return the existing booking
    res.status(200).json(existingBooking);
});

//@desc Accept booking
//@route PUT /api/bookings/accept-booking?clientId=<clientId>&sitterId=<sitterId>
//@access public
const acceptBooking = asyncHandler(async (req, res) => {
    const { clientId, sitterId } = req.query;

    const acceptedBooking = await Booking.findOneAndUpdate(
        { clientId, sitterId, status: 'pending' },
        { status: 'accepted' },
        { new: true }, // return updated document
    );

    // check if booking exists
    if ( !acceptedBooking ) {
        res.status(404);
        throw new Error(`Pending booking does not exist.`);
    };
    
    // also update the chat document most recent booking id
    const updateChat = await Chat.findOneAndUpdate(
        { clientId, sitterId },
        { mostRecentBookingId: acceptedBooking._id },
        { new: true }
    );

    console.log('Chat document successfully updated:', updateChat);

    // if yes, accept booking
    res.status(200).json(acceptedBooking);
});

//@desc Cancel booking
//@route PUT /api/bookings/cancel-booking?clientId<clientId>&sitterId=<sitterId>&role=<role>
//@access public
const cancelBooking = asyncHandler(async (req, res) => {
    const { clientId, sitterId, role } = req.query;

    const cancelledBooking = await Booking.findOneAndUpdate(
        { clientId, sitterId, status: 'pending' },
        role === 'client' ? { status: 'completed', clientStatus: 'cancelled' } : { status: 'completed', sitterStatus: 'cancelled' },
        { new: true }, // return updated document
    );
    
    // check if booking exists
    if ( !cancelledBooking ) {
        res.status(404);
        throw new Error(`Booking does not exist.`);
    };

    // also update the chat document most recent booking id
    const updateChat = await Chat.findOneAndUpdate(
        { clientId, sitterId },
        { mostRecentBookingId: cancelledBooking._id },
        { new: true }
    );

    console.log('Chat document successfully updated:', updateChat);
    
    // if yes, cancel booking
    res.status(200).json(cancelledBooking);
});

//@desc Delete booking
//@route DELETE /api/bookings/delete-booking?clientId=<clientId>&sitterId=<sitterId>
//@access public
const deleteBooking = asyncHandler(async (req, res) => {
    const { clientId, sitterId } = req.query;
    
    const deletedBooking = await Booking.findOneAndDelete({ clientId, sitterId, status: 'pending' });
    
    // check if booking exists
    if ( !deletedBooking ) {
        res.status(404);
        throw new Error(`Booking does not exist.`);
    };

    // also update the chat document most recent booking id
    const updateChat = await Chat.findOneAndUpdate(
        { clientId, sitterId },
        { mostRecentBookingId: deletedBooking._id },
        { new: true }
    );

    console.log('Chat document successfully updated:', updateChat);
    
    // if yes, delete booking
    res.status(200).json(deletedBooking);
});

//@desc Complete booking
//@route PUT /api/bookings/complete-booking?clientId=<clientId>&sitterId=<sitterId>&role=<role>&action=<action>
//@access public
const completeBooking = asyncHandler(async (req, res) => {
    const { clientId, sitterId, role, action } = req.query;

    // find the non-completed booking
    const booking = await Booking.findOne({ clientId, sitterId, status: { $ne: 'completed' } }); 
    
    // check if non-completed booking exists
    if ( !booking ) {
        res.status(404);
        throw new Error(`Booking does not exist.`);
    };

    // update status based on role and action
    if ( role === 'client' && action === 'complete' ) {
        booking.clientStatus = 'completed';
    };
    
    if ( role === 'sitter' && action === 'complete' ) {
        booking.sitterStatus = 'completed';
    };


    // if there's no action query, check if both sitter and client already completed the booking
    if ( booking.clientStatus === 'completed' && booking.sitterStatus === 'completed' ) {
        booking.status = 'completed';
    };

    await booking.save(); // save document

    // also update the chat document most recent booking id
    const updateChat = await Chat.findOneAndUpdate(
        { clientId, sitterId },
        { mostRecentBookingId: booking._id },
        { new: true }
    );

    console.log('Chat document successfully updated:', updateChat);

    res.status(200).json(booking);

});

module.exports = {
    bookSitter,
    getBooking,
    acceptBooking,
    cancelBooking,
    deleteBooking,
    completeBooking,
};