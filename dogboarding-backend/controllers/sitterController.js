const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const DogSitter = require('../models/dogSitterModel');

//@desc Login the sitter
//@route POST /api/sitters/login
//@access public
const loginSitter = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ( !email || !password ) {
        res.status(400);
        throw new Error(`Email and password are required`);
    };

    const sitter = await DogSitter.findOne({ email }).select('+password');
    if ( sitter && (await bcrypt.compare(password, sitter.password)) ) {
        
        const sitterData = {
            _id: sitter._id,
            email: sitter.email,
            firstName: sitter.firstName,
            lastName: sitter.lastName,
            status: sitter.status,
            role: sitter.role,
            ratings: sitter.ratings, // Include entire ratings object
            adjustedRating: sitter.adjustedRating,
            location: sitter.location,
        };
        
        const accessToken = jwt.sign(
            {
                user: sitterData,
            },
                process.env.ACCESS_TOKEN_SECRET,
        );

        res.status(201).json({ accessToken });
    } else {
        res.status(401);
        throw new Error(`Email or password is not valid`);
    };
    
});

//@desc Get sitter info
//@route GET /api/sitters/current
//@access private
const currentSitter = (req, res) => {
    res.status(200).json(req.user);

    /**
    // get hashed token from header
    const authHeader = req.headers['authorization'];
    let sitterTokenId;
    
    if ( authHeader && authHeader.startsWith('Bearer ') ) {
        sitterTokenId = authHeader.split(' ')[1];
    };

    if ( !sitterTokenId ) {
        res.status(403);
        throw new Error('Unauthorized access. No token reference provided.');
    };

    // if provided id is not valid
    if ( !mongoose.Types.ObjectId.isValid(sitterTokenId) ) {
        res.status(400);
        throw new Error('Provided ID is not a valid token reference.');
    };
    
    const token = await Token.findById(sitterTokenId);
    if ( token ) {
        // verify the sitter token and decode it
        const decoded = jwt.verify(token.sitterToken, process.env.ACCESS_TOKEN_SECRET);
        
        res.status(200).json(decoded.user);
    } else { // if provided id is valid but does not exist in the database
        res.status(404);
        throw new Error('Token does not exist.');
    }
    **/

};

/**
//@desc Delete all tokens in the database
//@route DELETE /api/sitters/delete-token
//@access public
const deleteAllSitterTokens = asyncHandler(async (req, res) => {
    const deletedTokens = await Token.deleteMany({});
    
    res.status(200).json(deletedTokens);
});
**/

module.exports = {
    loginSitter,
    currentSitter,
};