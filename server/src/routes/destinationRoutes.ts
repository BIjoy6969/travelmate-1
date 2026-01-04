import express from 'express';
import {
    getDestinations,
    addDestination,
    deleteDestination,
} from '../controllers/destinationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getDestinations)
    .post(protect, addDestination);

router.delete('/:id', protect, deleteDestination);

export default router;
