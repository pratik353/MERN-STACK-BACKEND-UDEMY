const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const fileUpload = multer({
    limits: 500000, // limit of file in bytes
    storage: multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, 'uploads/images'); 
        }, // second arg of callback function is destination of file storage (dir path)
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]; // get dynamically get extension of file
            cb(null, uuidv4() + '.' + ext); // set dynamic name
        } // by which name file sould be store
    }), // where file should be store
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];  // !! operator is used to convert undefined OR null into false
        let error = isValid ? null : new Error('Invalid mime type')
        cb(error, isValid);
    } // filtering files and validation of file
});

module.exports = fileUpload;