const asyncHandler = require('express-async-handler');
const { authorize, uploadToDrive, deleteFileInDriveViaChatId } = require('../utils/googleDriveUtil');
const Message = require('../models/messageModel');


//@desc Send file to google drive then retrieve its URL
//@route POST /api/messages/send-file
//@access public
const sendFileGetUrl = asyncHandler(async (req, res) => {
    const { email, chatId, senderModel } = req.body;
    const file = req.file;

    // authenticate user to access google drive
    const authClient = await authorize();

    // format file name to be uploaded to google drive
    const filename = `${chatId} ${senderModel} ${email}`;

    // upload file to google drive
    // store the resolved value (file public URL) here
    // include folder id
    const fileId = await uploadToDrive(authClient, file, filename, '1tdblkDpwAtvpuHtGYxh5mD0ESAWHVxIs');

    res.status(201).json(fileId);
});

//@desc Delete all messages in a chat room
//@route DELETE /api/messages/delete-messages/:chatId
//@access public
const deleteMessages = asyncHandler(async (req, res) => {
    // authenticate user to access google drive
    const authClient = await authorize();
    
    // get chat id from params
    const chatId = req.params.chatId;

    // delete all messages in chat id
    await Message.deleteMany({ chatId });

    // delete files in google drive via chat id
    await deleteFileInDriveViaChatId(authClient, chatId, '1tdblkDpwAtvpuHtGYxh5mD0ESAWHVxIs');

    res.status(200).json({ message: `Deleted all messages in chatId: ${chatId}` });
});

module.exports = {
    sendFileGetUrl,
    deleteMessages,
};