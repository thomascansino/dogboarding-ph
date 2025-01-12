const mongoose = require('mongoose');

const dogSitterSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: [true, 'Email address is already taken'],
        },
        password: {
            type: String,
            required: true,
            select: false, // exclude from query results
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'sitter',
        },
        ratings: {
            totalRating: {
                type: Number,
                default: 0, // sum of all ratings given by clients
            },
            numberOfRatings: {
                type: Number,
                default: 0, // total number of customers who have rated
            },
        },
        adjustedRating: {
            type: Number,
            default: 0, // adjusted rating (bayesian)
        },
        profilePicture: {
            type: String,
            default: "1kv80mxcZKhs8BtaT3h0FoatJyXKP-bKR",
        },
        location: {
            type: String,
            default: "",
        },
        images: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        numberOfDogsToWatch: {
            type: String,
            default: "",
        },
        acceptedDogSize: {
            type: [String],
            default: [],
        },
        levelOfAdultSupervision: {
            type: String,
            default: "",
        },
        placeOfDogWhenUnsupervised: {
            type: String,
            default: "",
        },
        placeOfDogWhenSleeping: {
            type: String,
            default: "",
        },
        numberOfPottyBreaks: {
            type: String,
            default: "",
        },
        numberOfWalks: {
            type: String,
            default: "",
        },
        typeOfHome: {
            type: String,
            default: "",
        },
        outdoorAreaSize: {
            type: String,
            default: "",
        },
        emergencyTransport: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
        },
        completedBookings: {
            type: Number,
            default: 0, // don't forget to set default to 0
        },
    },
    {
        timestamps: true,
    },
);

// pre-save hook to calculate adjustedRating (bayesian adjustment) when a sitter is created/updated
dogSitterSchema.pre('save', function(next) {
    const M = 3; // baseline average rating (assume 3 is overall average of ratings across all sitters)
    const C = 5; // baseline number of ratings (max rating is 5/5)

    // avoid calculation if there are no ratings
    if (this.ratings.numberOfRatings === 0) {
        this.adjustedRating = M; 
    } else {
        // compute average rating
        const averageRating = this.ratings.totalRating / this.ratings.numberOfRatings; 
        // compute adjusted rating
        this.adjustedRating = (C * M + averageRating * this.ratings.numberOfRatings) / (C + this.ratings.numberOfRatings);
    };

    next();
});

module.exports = mongoose.model('DogSitter', dogSitterSchema);