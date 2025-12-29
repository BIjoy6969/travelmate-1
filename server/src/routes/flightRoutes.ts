import express from 'express';
import { searchFlights } from '../controllers/flightController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Search flights
// Route: GET /api/flights/search
router.get('/search', protect, searchFlights);

export default router;
