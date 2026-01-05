const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const destinationController = require('../controllers/destinationController');
const itineraryController = require('../controllers/itineraryController');
const hotelController = require('../controllers/hotelController');
const bookingController = require('../controllers/bookingController');

// Destinations
router.get('/destinations', destinationController.getTopDestinations);

// Itinerary
router.post('/itinerary', protect, itineraryController.generateItinerary);

// Hotels
router.get('/hotels/search', hotelController.searchHotels);

// Bookings
router.post('/bookings', protect, bookingController.createBooking);
router.get('/bookings', protect, bookingController.getUserBookings);
router.put('/bookings/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
