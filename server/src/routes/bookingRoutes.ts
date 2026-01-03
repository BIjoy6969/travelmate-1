import express, { Request, Response, NextFunction } from 'express';
import { createBooking, getUserBookings, deleteBooking, cancelBooking } from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', (req: Request, res: Response, next: NextFunction) => {
    next();
}, createBooking);

router.get('/:userId', getUserBookings);
router.get('/', protect, getUserBookings);
router.put('/:id/cancel', cancelBooking);
router.delete('/:id', protect, deleteBooking);

export default router;
