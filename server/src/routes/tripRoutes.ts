import express from 'express';
import { createTrip, getTrips, updateTrip, deleteTrip } from '../controllers/tripController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // Protect all trip routes

router.post('/', createTrip);
router.get('/', getTrips);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
