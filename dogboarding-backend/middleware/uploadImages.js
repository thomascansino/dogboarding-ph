const multer = require('multer');
const path = require('path');

// use disk storage for handling multiple uploads to avoid memory from overflowing
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // uploads folder in root
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // define file name format
        cb(null, file.originalname);
    },
}); 

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => { // filter the file, you can access the file using file parameter

        const filetypes = /jpeg|jpg|png/; // define file types to be filtered
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // return true if file extension is an image 
        const mimetype = filetypes.test(file.mimetype); // return true if file mime type is an image
        
        if ( extname && mimetype ) { // if extension and mime types both return true
            return cb(null, true); // pass the file through the filter using true
        } else {
            cb(new Error('Only image files are allowed!'), false); // reject the file through the filter using false
        };

    },
});

module.exports = upload;