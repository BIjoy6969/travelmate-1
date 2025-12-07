const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get reviews for a target (destination/hotel)
router.get('/:targetId', async (req, res) => {
    try {
        const reviews = await Review.find({ targetId: req.params.targetId });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a review
router.post('/', async (req, res) => {
    const { userId, targetId, rating, categories, comment } = req.body;
    try {
        const newReview = new Review({
            userId,
            targetId,
            rating,
            categories,
            comment
        });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
