const { Server } = require('socket.io');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');


let io;

const initSocket = (server) => {
    // initialize socket.io
    // new Server(HTTPserver, cors for sharing)
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    

    // create socket object when a user connects to represent the connection between the frontend and the backend
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id); // each chat user gets a unique ID when they connect
        
        // listen to request from frontend to send conversations of the current user
        socket.on('loadConversations', async ({ currentUser, currentPage }) => {
            try { 
                const { _id, role } = currentUser;
                const page = currentPage; // current page
                const limit = 10; // limit to 10 conversations 
                const skip = (page - 1) * limit; // if page = 1, skip 0 conversations; if page = 2, skip 10 conversations

                // determine the role of the current user (client or sitter)
                // get conversations from database
                const conversations = await Chat.find( role === 'client' ? { clientId: _id } : { sitterId: _id })
                    .populate('clientId', 'username profilePicture')
                    .populate('sitterId', 'firstName lastName profilePicture')
                    .populate('lastMessageId', 'senderId text fileUrl createdAt')
                    .populate('mostRecentBookingId')
                    .sort({ updatedAt: -1 }) // sort from recent to oldest
                    .skip(skip) // skip conversations that should not be shown on the page
                    .limit(limit); // limit to 10 conversations
                
                const totalConversations = await Chat.countDocuments( role === 'client' ? { clientId: _id } : { sitterId: _id }); // count no. of conversations
                
                // send conversations to frontend
                socket.emit('conversationsLoaded', {
                    conversations,
                    currentPage: page,
                    totalPages: Math.ceil(totalConversations / limit),
                    totalConversations,
                });
            } catch (err) {
                console.error('Failed to get conversations:', err);
            };
        });

        // join a chat room
        socket.on('joinChat', async (data) => {
            try {
                // check if a chatroom already exists between the client and sitter
                let chat = await Chat.findOne({ clientId: data.clientId, sitterId: data.sitterId });
                if ( !chat ) {
                    chat = await Chat.create({
                        clientId: data.clientId,
                        sitterId: data.sitterId,
                    });
                    console.log('Created a new chat room:', chat._id);
                } else {
                    console.log('Chat room already exists:', chat._id);
                };

                // join the created (or existing) chat room
                socket.join(chat._id.toString()); // chat id is used as room name
                // send chatId back to the frontend
                socket.emit('chatId', chat._id.toString());
                console.log('User joined chat room:', chat._id.toString());


                // find all messages of the specific chat id
                const messagesDocument = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
                // send chat history to frontend
                socket.emit('chatHistory', messagesDocument);

            } catch (err) {
                console.error('Error joining chat room:', err);
            };
        });

        // listen to request from frontend to send messages
        socket.on('sendMessage', async (data) => {
            try {
                // save the message to database
                const newMessage = await Message.create({
                    chatId: data.chatId,
                    senderId: data.senderId,
                    senderModel: data.senderModel,
                    text: data.text,
                });

                // update lastMessageId field in chat document
                await Chat.findByIdAndUpdate(
                    data.chatId,
                    { lastMessageId: newMessage._id },
                );

                // broadcast the message to the specific chat room
                io.to(data.chatId).emit('receiveMessage', data); 

                console.log('Message saved:', newMessage.text);
            } catch (err) {
                console.error('Error saving message:', err);
            };
        });

        // listen to request from frontend to send file
        socket.on('sendFile', async (data) => {
            try {
                // save the message to database
                const newMessage = await Message.create({
                    chatId: data.chatId,
                    senderId: data.senderId,
                    senderModel: data.senderModel,
                    fileUrl: data.fileUrl,
                });

                // update lastMessageId field in chat document
                await Chat.findByIdAndUpdate(
                    data.chatId,
                    { lastMessageId: newMessage._id },
                );

                // broadcast the message to the specific chat room
                io.to(data.chatId).emit('receiveMessage', data); 

                console.log('Message saved:', newMessage.fileUrl);
            } catch (err) {
                console.error('Error saving message:', err);
            };
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    
    return io;
};

const getSocketInstance = () => io;

module.exports = { 
    initSocket, 
    getSocketInstance,
};