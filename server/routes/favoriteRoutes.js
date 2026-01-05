const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Get all favorites for a user
router.get('/:userId', async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new favorite
router.post('/', async (req, res) => {
    const { userId, destinationId, name, image, location, notes } = req.body;

    try {
        const newFavorite = new Favorite({
            userId,
            destinationId,
            name,
            image,
            location,
            notes
        });
        const savedFavorite = await newFavorite.save();
        res.status(201).json(savedFavorite);
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

// Update notes for a favorite
router.patch('/:id', async (req, res) => {
    try {
        const updatedFavorite = await Favorite.findByIdAndUpdate(
            req.params.id,
            { notes: req.body.notes },
            { new: true }
        );
        res.json(updatedFavorite);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
