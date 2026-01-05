const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/search', flightController.searchFlights);
router.post('/book', flightController.createBooking);
router.get('/bookings', flightController.getUserBookings);

module.exports = router;
