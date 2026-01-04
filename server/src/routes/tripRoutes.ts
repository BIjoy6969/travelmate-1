import express from 'express';
import { createTrip, getTrips, updateTrip, deleteTrip } from '../controllers/tripController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router(); //protect:

// Verifies JWT

// Extracts user info

// Attaches to request:

// req.user = { _id: 'abc123', ... }


router.use(protect); // Protect all trip routes

router.post('/', createTrip);
router.get('/', getTrips);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
