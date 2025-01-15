const { OAuth2Client } = require('google-auth-library');

// initialize oauth2client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_OAUTH);

const verifyGoogleToken = async (token) => {
    try {
        // verify that the token is valid and issued by google
        const ticket = await client.verifyIdToken({ 
            idToken: token, // token given by google login
            audience: process.env.GOOGLE_CLIENT_ID_OAUTH, // must be same client ID used in the frontend (google log in)
        });
        
        // extract google user data from the token
        const payload = ticket.getPayload(); 
        return payload;
    } catch (err) {
        throw new Error('Google token verification failed');
    };
};

module.exports = {
    verifyGoogleToken
};

