const jwt = require('jsonwebtoken');

// generate token with admin security
const generateToken = (payload) => {
    
    const token = jwt.sign({ user: payload }, process.env.ACCESS_TOKEN_SECRET);

    return token; // return the token
};

module.exports = {
    generateToken,
};