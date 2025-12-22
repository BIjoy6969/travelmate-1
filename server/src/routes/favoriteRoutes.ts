import express, { Request, Response } from 'express';
import Favorite from '../models/Favorite';

const router = express.Router();

// Get all favorites for a user
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId });
        res.json(favorites);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new favorite
router.post('/', async (req: Request, res: Response) => {
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
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Remove a favorite
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const removedFavorite = await Favorite.findByIdAndDelete(req.params.id);
        if (!removedFavorite) {
            res.status(404).json({ message: 'Favorite not found' });
            return;
        }
        res.json({ message: 'Favorite deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Update notes for a favorite
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const updatedFavorite = await Favorite.findByIdAndUpdate(
            req.params.id,
            { notes: req.body.notes },
            { new: true }
        );
        res.json(updatedFavorite);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
