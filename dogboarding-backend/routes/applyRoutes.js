const express = require('express');
const router = express.Router();
const { 
    sendApplication,
    acceptApplication,
    rejectApplication,
    initializeProfile,
    completeProfile,
} = require('../controllers/applyController');
const upload = require('../middleware/upload');
const uploadImage = require('../middleware/uploadImage');
const validateToken = require('../middleware/validateTokenHandler');

router.post('/', upload.single('id'), sendApplication);

router.get('/accept/:token', validateToken, acceptApplication);

router.get('/reject/:token', validateToken, rejectApplication);

router.get('/initialize-profile', validateToken, initializeProfile);

router.put('/complete-profile', validateToken, uploadImage.single('profilePicture'), completeProfile);

module.exports = router;