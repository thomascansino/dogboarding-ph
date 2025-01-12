const express = require('express');
const router = express.Router();
const {
    getAllListedSitters,
    getSitter,
    editProfile,
    deleteImage,
    masterController,
} = require('../controllers/listingController');
const uploadImage = require('../middleware/uploadImage');

router.get('/', getAllListedSitters);

router.get('/:sitterId', getSitter);

router.put('/edit-profile/:sitterId', uploadImage.single('file'), editProfile);

router.put('/edit-profile/profile-images/:sitterId', uploadImage.single('image'), editProfile);

router.put('/delete-image/:sitterId', deleteImage);

router.put('/master', masterController);

module.exports = router;