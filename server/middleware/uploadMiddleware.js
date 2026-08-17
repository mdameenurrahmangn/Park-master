const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Profile Photos
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles/';
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`)
});

// Vehicle Photos & RC
const vehicleStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/vehicles/';
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `vehicle-${Date.now()}${path.extname(file.originalname)}`)
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed!'));
    }
};

exports.uploadProfile = multer({ storage: profileStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadVehicle = multer({ storage: vehicleStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });