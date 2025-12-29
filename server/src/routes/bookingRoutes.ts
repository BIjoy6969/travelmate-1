import express from 'express';
import { createBooking, getUserBookings, deleteBooking } from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getUserBookings);
router.delete('/:id', protect, deleteBooking);

export default router;
