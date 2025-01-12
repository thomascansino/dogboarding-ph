const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        clientId: { // user participant
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        sitterId: { // sitter participant
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DogSitter',
        },
        lastMessageId: { // id of last message of a convo
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        mostRecentBookingId: { // id of most recent booking of a convo
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
    },
    {
        timestamps: true,
    },
);

// unique compound index
chatSchema.index({ clientId: 1, sitterId: 1 }, { unique: true, });

module.exports = mongoose.model('Chat', chatSchema);