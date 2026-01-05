const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Extract cloud name from URL if not explicitly provided
const cloudName = process.env.CLOUDINARY_CLOUD_NAME ||
    (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split('@')[1] : null);

cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'travelmate_reviews',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const parser = multer({ storage: storage });

module.exports = parser;
