import express, { Request, Response } from 'express';
import Review from '../models/Review';

const router = express.Router();

// Get reviews for a target (destination/hotel)
router.get('/:targetId', async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find({ targetId: req.params.targetId });
        res.json(reviews);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Add a review
router.post('/', async (req: Request, res: Response) => {
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
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
