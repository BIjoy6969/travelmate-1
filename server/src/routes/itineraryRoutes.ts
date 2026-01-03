import express from 'express';
import { generateItinerary } from '../controllers/itineraryController';

const router = express.Router();

router.post('/', generateItinerary);

export default router;
