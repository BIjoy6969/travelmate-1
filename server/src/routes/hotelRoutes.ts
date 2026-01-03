import express from 'express';
import { searchHotels } from '../controllers/hotelController';

const router = express.Router();

router.get('/search', searchHotels);

export default router;
