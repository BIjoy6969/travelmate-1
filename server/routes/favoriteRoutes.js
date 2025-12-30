const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Get all favorites for a user
router.get('/:userId', async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new favorite (Trip Plan)
router.post('/', async (req, res) => {
    const {
        userId, destinationId, name, image, location, lat, lng,
        travelStyle, totalBudget, tripStartDate, tripEndDate,
        estimatedBreakdown, itinerary
    } = req.body;

    try {
        // Auto-calculate planNumber: count existing plans for this destination + 1
        const existingPlans = await Favorite.countDocuments({ userId, name });
        const planNumber = existingPlans + 1;

        const newFavorite = new Favorite({
            userId,
            destinationId,
            name,
            image,
            location,
            lat,
            lng,
            planNumber,
            travelStyle,
            totalBudget,
            tripStartDate,
            tripEndDate,
            estimatedBreakdown,
            itinerary
        });
        const savedFavorite = await newFavorite.save();
        res.status(201).json(savedFavorite);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a favorite's plan data
router.patch('/:id', async (req, res) => {
    try {
        const updatedFavorite = await Favorite.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedFavorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.json(updatedFavorite);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove a favorite
router.delete('/:id', async (req, res) => {
    try {
        const removedFavorite = await Favorite.findByIdAndDelete(req.params.id);
        if (!removedFavorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.json({ message: 'Favorite deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
