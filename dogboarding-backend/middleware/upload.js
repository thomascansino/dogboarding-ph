const multer = require('multer');

const storage = multer.memoryStorage(); // use memory as temporary storage

const upload = multer({ storage }); // upload in temporary storage

module.exports = upload;