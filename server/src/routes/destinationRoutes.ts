import express from 'express';
import {
    getDestinations,
    addDestination,
    deleteDestination,
    getTopDestinations,
} from '../controllers/destinationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/top', getTopDestinations);

router.route('/')
    .get(protect, getDestinations)
    .post(protect, addDestination);

router.delete('/:id', protect, deleteDestination);

export default router;
