const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    // try to get token from header
    const authHeader = req.headers['authorization'];
    let token;

    if ( authHeader && authHeader.startsWith('Bearer ') ) {
        token = authHeader.split(' ')[1];
    };

    // if no token in the header, try to get from params
    if ( !token ) {
        token = req.params.token;
    };

    // if there's no token in either, return an error
    if ( !token ) {
        return res.status(403).json({ message: 'Unauthorized access. No token provided.' });
    };

    try {
        // verify the token and decode it
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // store the decoded data into req object
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized access. Invalid token.' });
    };
};

module.exports = validateToken;