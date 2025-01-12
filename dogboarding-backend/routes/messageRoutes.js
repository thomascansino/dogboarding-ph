const express = require('express');
const router = express.Router();
const {
    sendFileGetUrl,
    deleteMessages,
} = require('../controllers/messageController');
const upload = require('../middleware/upload');

router.post('/send-file', upload.single('file'), sendFileGetUrl);

router.delete('/delete-messages/:chatId', deleteMessages);

module.exports = router;