const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const DogSitter = require('../models/dogSitterModel');
const { authorize, uploadToDrive, deleteFileInDrive } = require('../utils/googleDriveUtil');

//@desc Get all listed sitters from database
//@route GET /api/listings?page=<pageNumber>&city=<city>
//@access public
const getAllListedSitters = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // current page, default to 1
    const limit = 10; // limit to 10 pages
    const skip = (page - 1) * limit; // if page = 1, skip 0 documents; if page = 2, skip 10 documents, etc..
    
    // filter only listed sitters if no city is provided in the query
    const filter = { status: 'listed' }; 
    
    // check if city is provided in the query
    if ( req.query.city ) {
        // if yes, add a location property to the filter object
        // use $regex to partial match req.query.city and $options 'i' to make it case-insensitive
        // use regex also to match only the first segment before the first ", "
        filter.location = { 
            $regex: `^${req.query.city}(,|$)`, 
            $options: 'i' 
        };
    };

    const listedSitters = await DogSitter.find(filter) // apply filter accordingly
        .sort({ adjustedRating: -1 }) // sort by pre-calculated adjusted rating from highest to lowest
        .skip(skip) // skip unnecessary documents
        .limit(limit); // limit to 10 sitters

    const totalSitters = await DogSitter.countDocuments({ status: 'listed' }); // count the no. of listed dogsitters

    res.status(200).json({
        listedSitters,
        currentPage: page,
        totalPages: Math.ceil(totalSitters / limit),
        totalSitters,
    });
});

//@desc Get the selected listed sitter from database
//@route GET /api/listings/:sitterId
//@access public
const getSitter = asyncHandler(async (req, res) => {
    const { sitterId } = req.params;

    if ( !mongoose.Types.ObjectId.isValid(sitterId) ) {
        res.status(400);
        throw new Error('Invalid sitter ID format');
    };
    
    // find the selected listed sitter via sitter ID and status
    const sitter = await DogSitter.findOne({ _id: sitterId, status: 'listed' });

    // if sitter is not found
    if ( !sitter ) {
        res.status(404);
        throw new Error(`Sitter does not exist!`);
    };

    res.status(200).json(sitter);
});

//@desc Edit profile
//@route PUT /api/listings/edit-profile/:sitterId
//@access public
const editProfile = asyncHandler(async (req, res) => {
    const { 
        summary, 
        description, 
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
        email,
    } = req.body;
    let file;
    let image;
    
    if ( req.file ) {
        if ( req.file.fieldname === 'file' ) {
            file = req.file;
        } else {
            image = req.file;
        };
    };
    
    if ( !mongoose.Types.ObjectId.isValid(req.params.sitterId) ) {
        res.status(400);
        throw new Error('Invalid sitter ID format');
    };

    const updateFields = {};
    if (summary !== undefined) updateFields.summary = summary; // optional
    if (description !== undefined) updateFields.description = description; // optional
    if (numberOfDogsToWatch !== undefined) {
        if (numberOfDogsToWatch) {
            updateFields.numberOfDogsToWatch = numberOfDogsToWatch;
        } else {
            res.status(400);
            throw new Error('Please indicate number of dogs to watch.');
        };
    };
    if (acceptedDogSize !== undefined ) {
        if (acceptedDogSize.length > 0) {
            updateFields.acceptedDogSize = acceptedDogSize;
        } else {
            res.status(400);
            throw new Error('Must have atleast 1 accepted dog size.');
        };
    };
    if (levelOfAdultSupervision !== undefined) {
        if (levelOfAdultSupervision) {
            updateFields.levelOfAdultSupervision = levelOfAdultSupervision;
        } else {
            res.status(400);
            throw new Error('Please indicate the level of adult supervision.');
        };
    };
    if (placeOfDogWhenUnsupervised !== undefined) {
        if (placeOfDogWhenUnsupervised) {
            updateFields.placeOfDogWhenUnsupervised = placeOfDogWhenUnsupervised;
        } else {
            res.status(400);
            throw new Error('Please indicate where the dog will be when unsupervised.');
        };
    };
    if (placeOfDogWhenSleeping !== undefined) {
        if (placeOfDogWhenSleeping) {
            updateFields.placeOfDogWhenSleeping = placeOfDogWhenSleeping;
        } else {
            res.status(400);
            throw new Error('Please indicate where the dog will be sleeping.');
        };
    };
    if (numberOfPottyBreaks !== undefined) {
        if (numberOfPottyBreaks) {
            updateFields.numberOfPottyBreaks = numberOfPottyBreaks;
        } else {
            res.status(400);
            throw new Error('Please indicate the number of potty breaks.');
        };
    };
    if (numberOfWalks !== undefined) {
        if (numberOfWalks) {
            updateFields.numberOfWalks = numberOfWalks;
        } else {
            res.status(400);
            throw new Error('Please indicate the number of walks.');
        };
    };
    if (typeOfHome !== undefined) {
        if (typeOfHome) {
            updateFields.typeOfHome = typeOfHome;
        } else {
            res.status(400);
            throw new Error('Please indicate the type of home.');
        };
    };
    if (outdoorAreaSize !== undefined) {
        if (outdoorAreaSize) {
            updateFields.outdoorAreaSize = outdoorAreaSize;
        } else {
            res.status(400);
            throw new Error('Please indicate the outdoor area size.');
        };
    };
    if (emergencyTransport !== undefined) {
        if (emergencyTransport) {
            updateFields.emergencyTransport = emergencyTransport;
        } else {
            res.status(400);
            throw new Error('Please indicate if emergency transport is available.');
        };
    };
    if (file !== undefined && email !== undefined) {
        // authenticate user to access google drive
        const authClient = await authorize();

        // format file name of profile pic to be uploaded to google drive
        const filename = email;
        const isUnique = true; // unique files

        // replace profile picture img in google drive
        // store the resolved value (file public URL) here
        // include folder id
        const profilePictureUrl = await uploadToDrive(authClient, file, filename, '1zUz35-kewuATDv6cRo4YoKB2lxskoaWG', isUnique);

        updateFields.profilePicture = profilePictureUrl;
    };
    if (image !== undefined && email !== undefined) {
        // authenticate user to access google drive
        const authClient = await authorize();

        // format file name of profile pic to be uploaded to google drive
        const filename = email;
        const isUnique = false; // non-unique files

        // replace profile picture img in google drive
        // store the resolved value (file public URL) here
        // include folder id
        const profileImageUrl = await uploadToDrive(authClient, image, filename, '1SKeNEkzIz5slRQVVcm6tPhGkxPz0b2tJ', isUnique);
        
        // Use $push with $each and $position to prepend to the existing array
        if (!updateFields.$push) updateFields.$push = {}; // use $push operator to add new url to the array
        updateFields.$push.images = { $each: [profileImageUrl], $position: 0 }; // use $each to be explicit, $position: 0 to add url at the beginning of the array.
    };
    

    const updatedSitter = await DogSitter.findByIdAndUpdate(
        req.params.sitterId, 
        updateFields,
        { new: true },
    );
    
    // check if sitter exists
    if ( !updatedSitter ) {
        res.status(404);
        throw new Error(`This sitter doesn't exist!`);
    };

    console.log('Updated sitter:', updateFields);
    res.status(200).json(updatedSitter);  
});

//@desc Delete an image in images field in profile
//@route PUT /api/listings/delete-image/:sitterId
//@access public
const deleteImage = asyncHandler(async (req, res) => {
    const { imageId } = req.body;

    if ( !mongoose.Types.ObjectId.isValid(req.params.sitterId) ) {
        res.status(400);
        throw new Error('Invalid sitter ID format');
    };

    const updatedSitter = await DogSitter.findByIdAndUpdate(
        req.params.sitterId,
        { $pull: { images: imageId } }, // use $pull operator to remove a URL from the array
        { new: true },
    );

    if ( !updatedSitter ) {
        res.status(404);
        throw new Error(`This sitter doesn't exist!`);
    };

    // authenticate user to access google drive
    const authClient = await authorize();

    // include file id to be deleted
    await deleteFileInDrive(authClient, imageId);

    console.log('Deleted image in database:', imageId);
    res.status(200).json(updatedSitter);
});


//@desc Master controller
//@route ANY
//@access ANY
const masterController = asyncHandler(async (req, res) => {

    const allSitters = await DogSitter.find({});  // Fetch all the sitters
    const updatePromises = allSitters.map(async (sitter) => {
        // Generate a random price for each sitter
        const images = [
            '1l1wxtnSFN2TUvnC9dQYE3bcWgj2rbWe4',
            '1ay9Pbillfp9U98n5xSQ6evw1EAip-ePl',
            '1405bfMindVDZwft9xxJqSG8RK6UFhfZv',
            '1txgwlkoIex8fJ6fS9P1dZQv9zL-seJiS',
            '16oGAESP6w87BhfZLLT3hm1Vbv_CoZmYg',
            '1mV-b92ded-cJqNKpgyXFtvp416Ruvpz6',
            '1Sl8LrK-a2LgU4Cc8PtECg6aa2byi-oOY',
            '1lWSKgbhnlhkdaoDtF4UB4k7xj5IcK_5j',
            '1hlDNBIgwBMbcK6FONjOGaxz4Js58i1_m',
        ];  // Random price between 100 and 1100
        
        const description = `Lorem ipsum odor amet, consectetuer adipiscing elit. Eros tincidunt pretium orci purus elementum sit arcu. Sem morbi odio massa nibh tortor pellentesque? Dis curabitur posuere augue enim, primis senectus sit class nullam. Cras vitae litora himenaeos elementum dignissim vel ut. Porttitor libero tellus libero commodo accumsan dis inceptos. Bibendum penatibus habitant donec amet lacus quis.

Imperdiet inceptos dictumst interdum; sagittis maecenas rutrum donec. Primis rhoncus primis suscipit accumsan hac pretium aliquam sed. Aliquam lacinia imperdiet senectus; justo dictumst auctor. Rhoncus interdum dis diam viverra vel habitasse sem. Porta tortor pharetra phasellus torquent adipiscing vivamus pharetra. Ipsum venenatis quam habitasse dictumst primis vivamus maecenas dictumst eros. Cursus mus vestibulum imperdiet facilisis leo velit luctus lacinia.

Aliquet senectus purus consectetur senectus inceptos luctus. Lacinia magna purus eros porttitor, vivamus cras. Interdum dignissim inceptos potenti sollicitudin inceptos eleifend felis. Ipsum quisque imperdiet euismod quis placerat! Habitant in nisl aptent pulvinar egestas eros. Quisque fermentum sollicitudin mi diam efficitur magnis donec velit. Magna dignissim molestie senectus nisi turpis.`

        // Update the price for each sitter
        return DogSitter.updateOne(
            { _id: sitter._id },  // Find the document by its ID
            { $set: { description } }
        );
    });

    // Wait for all the update operations to finish
    await Promise.all(updatePromises);
    res.json(allSitters);
});


module.exports = {
    getAllListedSitters,
    getSitter,
    editProfile,
    deleteImage,
    masterController,
}