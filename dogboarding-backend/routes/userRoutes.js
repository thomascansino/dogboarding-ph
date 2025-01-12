const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    registerGoogleUser,
    loginGoogleUser,
    currentUser,
    getUser,
} = require('../controllers/userController');
const validateToken = require('../middleware/validateTokenHandler');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/register-google-user', registerGoogleUser);

router.post('/login-google-user', loginGoogleUser);

router.get('/current', validateToken, currentUser);

router.get('/:userId', getUser);


module.exports = router;
