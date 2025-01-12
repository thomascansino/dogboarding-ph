const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { verifyGoogleToken } = require('../utils/verifyGoogleToken');
const mongoose = require('mongoose');


// @desc Register the user
// @route POST /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
    // destructure the values
    const { email, username, password, confirmPassword } = req.body;

    if ( !email || !username || !password || !confirmPassword ) {
        res.status(400);
        throw new Error(`All fields are mandatory`);
    };

    if ( password !== confirmPassword ) {
        res.status(400);
        throw new Error(`Passwords do not match`);
    };

    const availableUser = await User.findOne({ email });
    if ( availableUser ) {
        res.status(400);
        throw new Error(`Email is already registered`);
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
    const user = await User.create({
        email,
        username,
        password: hashedPassword,
    });

    console.log(`User successfully created ${user}`);
    if ( user ) {
        res.status(201).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error(`User data is not valid`);
    };

});

// @desc Login the user
// @route POST /api/users/login
// @access public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if ( !email || !password ) {
        res.status(400);
        throw new Error(`Email and password are required`);
    };

    const user = await User.findOne({ email });
    if ( user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign(
            {
                user: {
                    username: user.username,
                    email: user.email,
                    _id: user.id,
                    profilePicture: user.profilePicture,
                    role: user.role,
                },
            },
                process.env.ACCESS_TOKEN_SECRET,
        );
        res.status(201).json({ accessToken });
    } else {
        res.status(401);
        throw new Error(`Email or password is not valid`);
    };

});

// @desc Verify google token & register google user into database if first time logging in
// @route POST /api/users/register-google-user
// @access public
const registerGoogleUser = asyncHandler(async (req, res) => {
    // get google token from header
    const authHeader = req.headers['authorization'];
    let googleToken;

    if ( authHeader && authHeader.startsWith('Bearer ') ) {
        googleToken = authHeader.split(' ')[1];
    };

    // if verification succeeds, store the payload here
    const googleUser = await verifyGoogleToken(googleToken);

    // before registering...
    // check if google user is already registered
    const existingGoogleUser = await User.findOne({ email: googleUser.email });
    // if yes, return the existing user from local db
    if ( existingGoogleUser ) {
        return res.status(200).json(existingGoogleUser);
    };

    // if not, create the google user in local database
    const newGoogleUser = await User.create({
        email: googleUser.email,
        username: googleUser.name,
        profilePicture: googleUser.picture,
    });

    console.log(`Google user successfully created ${newGoogleUser}`);
    return res.status(201).json(newGoogleUser);
});

// @desc Sign a new JWT for my app
// @route POST /api/users/login-google-user
// @access public
const loginGoogleUser = asyncHandler(async (req, res) => {
    const { email, username, profilePicture, _id } = req.body;
    
    // sign a new JWT for my app using the payload from successful verification
    const accessToken = jwt.sign(
        {
            user: {
                email,
                username,
                profilePicture,
                _id,
                role: 'client',
            },
        },
            process.env.ACCESS_TOKEN_SECRET,
    );
    res.status(201).json({ accessToken });
});

// @desc Current user info
// @route GET /api/users/current
// @access private
const currentUser = (req, res) => {
    res.status(200).json(req.user);
};

//@desc Get the selected user from database
//@route GET /api/users/:userId
//@access public
const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if ( !mongoose.Types.ObjectId.isValid(userId) ) {
        res.status(400);
        throw new Error('Invalid client ID format');
    };
    
    // find the user via client ID
    const selectedUser = await User.findOne({ _id: userId });

    // if user is not found
    if ( !selectedUser ) {
        res.status(404);
        throw new Error(`User does not exist!`);
    };

    res.status(200).json(selectedUser);
});


module.exports = {
    registerUser,
    loginUser,
    registerGoogleUser,
    loginGoogleUser,
    currentUser,
    getUser,
};