const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        sitterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DogSitter', // refer to dog sitter model
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // refer to user model
            required: true,
        },
        sitterStatus: {
            type: String,
            default: 'pending',
        },
        clientStatus: {
            type: String,
            default: 'pending',
        },
        status: {
            type: String,
            default: 'pending',
        },
        dogsNeededToBoard: {
            type: String,
            required: true,
            default: '',
        },
        breedOfDogs: {
            type: String,
            default: '',
        },
        sizeOfDogs: {
            type: [String],
            default: [],
            required: true,
        },
        additionalDetails: {
            type: String,
            default: '',
        },
        startDateAndTime: {
            type: Date,
            default: null,
            required: true,
        },
        endDateAndTime: {
            type: Date,
            default: null,
            required: true,
        },
        preferredMethod: {
            type: String,
            default: '',
            required: true,
        }
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Booking', bookingSchema);

