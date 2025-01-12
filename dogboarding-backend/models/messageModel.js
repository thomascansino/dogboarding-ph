const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        chatId: { // chat room id
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        },
        senderId: { // id of sender
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        senderModel: { // refPath: identify if User or DogSitter sent the message
            type: String,
            required: true,
            enum: ['User', 'DogSitter'],
        },
        text: { // content of message
            type: String,
        },
        fileUrl: { // google id of file
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// make a virtual field (not stored in the db but dynamically populated based on other fields when querying data)
messageSchema.virtual('sender', { // determine if User or DogSitter sent the message
    refPath: 'senderModel', // allows schema to decide which model sent the message based on its value
    localField: 'senderId', // contains _id of sender (e.g. '674c6606b1f9ca7c2655f3ec')
    foreignField: '_id', // the field in User/DogSitter model that matches senderId (e.g. '674c6606b1f9ca7c2655f3ec')
    justOne: true, // only 1 sender
});

module.exports = mongoose.model('Message', messageSchema);