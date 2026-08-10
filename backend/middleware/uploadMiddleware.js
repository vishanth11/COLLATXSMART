const multer = require('multer');
const path = require('path');
const config = require('../config');

// Multer storage configuration saving files securely on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Use a secure format without file extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
