const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
        email: {
            type: String,
            required: [true, 'Please add the user email address'],
            unique: [true, 'Email address is already taken'],
        },
        username: {
            type: String,
        },
        password: {
            type: String,
        },
        profilePicture: {
            type: String,
            default: "1kv80mxcZKhs8BtaT3h0FoatJyXKP-bKR",
        },
        role: {
            type: String,
            default: 'client',
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', userSchema);