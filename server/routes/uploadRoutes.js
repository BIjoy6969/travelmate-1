const express = require('express');
const router = express.Router();
const parser = require('../config/cloudinaryConfig');

router.post('/', parser.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
});

module.exports = router;
