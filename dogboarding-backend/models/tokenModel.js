/**
const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema(
    {
        sitterToken: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Token', tokenSchema);
**/