const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const connectDb = require('./config/dbConnection');
const { initSocket } = require('./utils/socket');
const http = require('http');
const app = express();

const port = process.env.PORT || 5000;

// connect to database
connectDb();

// middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

// body parser (req.body)
app.use(express.json());

// routes
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sitters', require('./routes/sitterRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/applications', require('./routes/applyRoutes'));

// handle errors
app.use(errorHandler);


// create http server instance
const server = http.createServer(app);

// initialize Socket.io
initSocket(server);


// start server and listen to specified port
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
