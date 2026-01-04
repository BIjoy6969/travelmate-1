const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const itineraryController = require('../controllers/itineraryController');
const hotelController = require('../controllers/hotelController');
const bookingController = require('../controllers/bookingController');

// Destinations
router.get('/destinations', destinationController.getTopDestinations);

// Itinerary
router.post('/itinerary', itineraryController.generateItinerary);

// Hotels
router.get('/hotels/search', hotelController.searchHotels);

// Bookings
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/:userId', bookingController.getUserBookings);
router.put('/bookings/:id/cancel', bookingController.cancelBooking);

module.exports = router;
