const express = require('express');
const router = express.Router();
const { 
    loginSitter,
    currentSitter,
} = require('../controllers/sitterController');
const validateToken = require('../middleware/validateTokenHandler');

router.post('/login', loginSitter);

router.get('/current', validateToken, currentSitter);

module.exports = router;