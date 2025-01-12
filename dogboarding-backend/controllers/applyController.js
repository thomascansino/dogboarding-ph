const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../utils/generateTokenUtil');
const DogSitter = require('../models/dogSitterModel');
const generator = require('generate-password');
const bcrypt = require('bcrypt');
const { authorize, uploadToDrive } = require('../utils/googleDriveUtil');

// set up nodemailer transporter
const transporter = nodemailer.createTransport(
    {
        secure: true,
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },  
    },
);

//@desc Send application form to email
//@route POST /api/applications
//@access public
const sendApplication = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, contact } = req.body;
    const id = req.file;
    const applicantId = uuidv4(); // generate unique applicant ID

    if ( !firstName || !lastName || !email || !contact || !id ) {
        res.status(400);
        throw new Error('Fill up all the fields required');
    };
    // check if email is already used
    const existingSitter = await DogSitter.findOne({ email });
    
    if ( existingSitter ) {
        res.status(400);
        throw new Error('Email is already used.');
    };

    // generate token with payload of applicant email and ID
    const token = generateToken({ email, applicantId, firstName, lastName });
    
    // send application form to admin
    const mailOptions = {
        from: process.env.GMAIL_USER, // dogboarding gmail
        to: process.env.RECEIVER_EMAIL, // dogboarding gmail
        subject: `Application for Dog Sitter - ${firstName} ${lastName}`,
        html: `
            <p style="font-weight: 900; font-size: 1.1em;">Hello DogBoardingPH,</p>
            <br>
            <p>I want to be a dog sitter. Here's my application form:</p>
            <ul>
                <li><span style="font-weight: 900;">Name:</span> ${firstName} ${lastName}</li>
                <li><span style="font-weight: 900;">Email:</span> ${email}</li>
                <li><span style="font-weight: 900;">Contact:</span> ${contact}</li>
                <li><span style="font-weight: 900;">Applicant ID:</span> ${applicantId}</li>
            </ul>
            <br>
            <p>Review the details and click an option below:</p>
            <div style="margin: 10px 0;">
                <a href="${process.env.BACKEND_URL}/api/applications/accept/${token}" style="padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Accept</a>
                <a href="${process.env.BACKEND_URL}/api/applications/reject/${token}" style="padding: 10px 15px; background-color: #dc3545; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Reject</a>
            </div>
        `,
        attachments: [
            {
                filename: id.originalname,
                content: id.buffer,
            },
        ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Application submitted successfully!' });
    
});

//@desc Send acceptance email to the applicant
//@route GET /api/applications/accept/:token
//@access private
const acceptApplication = async (req, res) => {
    const { email, applicantId, firstName, lastName } = req.user;
    
    try {
        // generate token for the applicant's complete profile link
        const token = generateToken({ email, firstName, lastName });

        // send acceptance email to applicant
        const acceptanceMail = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: `You're approved as a Dog Sitter!`,
            html: `
                <p style="font-weight: 900; font-size: 1.1em;">Congratulations ${firstName}!</p>
                <br>
                <p>Applicant ID: ${applicantId}</p>
                <p>Your application to be a dog sitter has been approved. To complete your sitter profile, please click the link below:</p>
                <a href="${process.env.FRONTEND_URL}/complete-profile/${token}" 
                    style="padding: 10px 15px; background-color: #D26524; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
                    Complete Profile
                </a>
                <br>
                <p>Important Reminders: ⚠️⚠️⚠️</p>
                <ul>
                    <li>Kindly do not share the link with others.</li>
                    <li>Upon completion of the form, your profile is publicly listed and the link will expire.</li>
                    <li>As long as you do not submit the form, your profile remains unlisted and you can access the link anytime.</li>
                </ul>
                <p>We are pleased to have you with us. Happy sitting! 🐾</p>
                <br>
                <p>Sincerely,</p>
                <p>DogBoardingPH Team</p>
            `,
        };

        await transporter.sendMail(acceptanceMail);
        res.status(200).json({ message: 'Approval email sent.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to accept application.' });
    };

};

//@desc Send rejection email to the applicant
//@route GET /api/applications/reject/:token
//@access private
const rejectApplication = async (req, res) => {
    const { email, firstName } = req.user;
    
    try {
        // send rejection email to applicant
        const rejectionMail = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: `Dog Sitter Application - Review Feedback`,
            html: `
                <p>Dear ${firstName},</p>
                <br>
                <p>Thank you for applying to be a dog sitter. Unfortunately, we could not approve your application due to inaccurate details in your submitted ID.</p>
                <p>We encourage you to double-check your ID details and resubmit your application for consideration. We look forward to hearing from you again!</p>
                <br>
                <p>Sincerely,</p>
                <p>DogBoardingPH Team</p>
            `,
        };

        await transporter.sendMail(rejectionMail);
        res.status(200).json({ message: 'Rejection email sent.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reject application.' });
    };

};

//@desc Create sitter profile
//@route GET /api/applications/initialize-profile
//@access private
const initializeProfile = async (req, res) => {
    const { email, firstName, lastName } = req.user;

    try {
        // check if email exists in database
        const existingSitter = await DogSitter.findOne({ email });
        
        // if it does not, create sitter profile
        if ( !existingSitter ) {
            // generate password with 16 characters, including numbers, symbols, & uppercase letters
            const password = generator.generate({
                length: 16,
                numbers: true,
                symbols: true,
            });
            console.log(password);
            const newSitter = await DogSitter.create({
                email,
                password,
                firstName,
                lastName,
                status: 'unlisted',
            });
            
            console.log(newSitter);
            return res.status(201).json(newSitter);
        };

        // if it does exist, check status to verify if sitter has already used the link or not.
        if ( existingSitter.status === 'listed' ) {
            return res.status(400).json({ message: 'The link has already been used.' });
        };

        // return existing sitter profile if the link hasn't been used yet.
        return res.status(200).json(existingSitter);
        
    } catch (err) {
        return res.status(500).json({
            message: `Failed to create sitter profile: ${err.message}`,
        });
    };
};

//@desc Submit the form and list the sitter
//@route PUT /api/applications/complete-profile
//@access public
const completeProfile = asyncHandler(async (req, res) => {
    const {
        password,
        confirmPassword,
        location,
        summary,
        numberOfDogsToWatch,
        acceptedDogSize,
        levelOfAdultSupervision,
        placeOfDogWhenUnsupervised,
        placeOfDogWhenSleeping,
        numberOfPottyBreaks,
        numberOfWalks,
        typeOfHome,
        outdoorAreaSize,
        emergencyTransport,
        price,
    } = req.body;
    const { email } = req.user;
    const profilePicture = req.file;

    // find sitter profile in database
    const sitter = await DogSitter.findOne({ email });
    if ( !sitter ) {
        res.status(404);
        throw new Error(`This sitter doesn't exist`);
    };

    if (
        !profilePicture || 
        !password || 
        !confirmPassword ||
        !location || 
        !summary || 
        !numberOfDogsToWatch || 
        !acceptedDogSize.length || // return true if there's no length (no option selected)
        !levelOfAdultSupervision || 
        !placeOfDogWhenUnsupervised || 
        !placeOfDogWhenSleeping || 
        !numberOfPottyBreaks || 
        !numberOfWalks || 
        !typeOfHome || 
        !outdoorAreaSize || 
        !emergencyTransport || 
        !price
    ) {
        res.status(400);
        throw new Error(`All fields are mandatory`);
    };

    if ( password !== confirmPassword ) {
        res.status(400);
        throw new Error(`Passwords do not match`);
    };

    // authenticate user to access google drive
    const authClient = await authorize();
    
    // format file name of profile pic to be uploaded to google drive
    const filename = email; 

    // upload profile picture img to google drive
    // store the resolved value (file public URL) here
    // include folder id
    const profilePictureUrl = await uploadToDrive(authClient, profilePicture, filename, '1zUz35-kewuATDv6cRo4YoKB2lxskoaWG');

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
    const listedSitter = await DogSitter.findOneAndUpdate(
        { email }, // query email of sitter to find in database
        { 
            ...req.body, // update everything based on the form
            acceptedDogSize: JSON.parse(acceptedDogSize), // parse to convert to array
            profilePicture: profilePictureUrl, // public URL of profile picture
            password: hashedPassword, // store the encrypted password
            status: 'listed', // set their status as listed
        },
        { new: true }, // return the updated document
    );

    res.status(200).json(listedSitter);
    
});

module.exports = {
    sendApplication,
    acceptApplication,
    rejectApplication,
    initializeProfile,
    completeProfile,
};