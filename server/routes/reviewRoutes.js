const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get reviews for a destination
router.get('/:destinationId', async (req, res) => {
    try {
        const reviews = await Review.find({ destinationId: req.params.destinationId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a review
router.post('/', async (req, res) => {
    const { destinationId, userId, userName, rating, comment, images } = req.body;

    // Simple validation
    if (!destinationId || !rating) {
        return res.status(400).json({ message: "Destination ID and Rating are required" });
    }

    const review = new Review({
        destinationId,
        userId,
        userName,
        rating,
        comment,
        images: images || []
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json({ message: "Review deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
