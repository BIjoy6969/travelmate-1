const axios = require('axios');
const FlightBooking = require('../models/FlightBooking');

/**
 * Search Flights via external API (flightapi.io)
 */
exports.searchFlights = async (req, res) => {
  try {
    const { from, to, date, adults = 1, children = 0, infants = 0, cabinClass = 'Economy', currency = 'USD' } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: 'Missing required query parameters: from, to, date' });
    }

    const apiKey = process.env.FLIGHT_API_KEY;
    if (!apiKey) {
      // No API key - fall through to demo data
      throw new Error('No FLIGHT_API_KEY configured - using demo data');
    }

    const url = `https://api.flightapi.io/onewaytrip/${apiKey}/${from}/${to}/${date}/${adults}/${children}/${infants}/${cabinClass}/${currency}`;

    const response = await axios.get(url);
    const data = response.data;

    if (!data.itineraries || data.itineraries.length === 0) {
      return res.json([]);
    }

    // Transform normalized data
    const legsMap = new Map((data.legs || []).map(leg => [leg.id, leg]));
    const carriersMap = new Map((data.carriers || []).map(carrier => [carrier.id, carrier]));
    const placesMap = new Map((data.places || []).map(place => [place.id, place]));
    const segmentsMap = new Map((data.segments || []).map(segment => [segment.id, segment]));

    const flights = data.itineraries.map(itinerary => {
      const legId = itinerary.leg_ids[0];
      const leg = legsMap.get(legId);

      if (!leg) return null;

      const segmentIds = leg.segment_ids || [];
      const carrierNames = segmentIds.map(segId => {
        const segment = segmentsMap.get(segId);
        const carrierId = segment?.marketing_carrier_id || segment?.operating_carrier_id;
        return carriersMap.get(carrierId)?.name || 'Unknown Airline';
      });
      const uniqueCarriers = [...new Set(carrierNames)].join(', ');

      const origin = placesMap.get(leg.origin_place_id);
      const destination = placesMap.get(leg.destination_place_id);

      const pricingOption = itinerary.pricing_options?.[0];
      const price = pricingOption?.price?.amount;
      const deepLink = pricingOption?.items?.[0]?.url;

      const durationMins = leg.duration;
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      const durationStr = `${hours}h ${mins}m`;

      return {
        id: itinerary.id,
        price,
        currency,
        deepLink,
        airline: uniqueCarriers,
        departureTime: leg.departure,
        arrivalTime: leg.arrival,
        duration: durationStr,
        stops: leg.stop_count,
        origin: origin?.display_code || origin?.name || from,
        destination: destination?.display_code || destination?.name || to
      };
    }).filter(f => f !== null);

    res.json(flights);
  } catch (error) {
    console.error('Flight Search Error - Falling back to demo data:', error.message);

    // Return Demo Data as fallback
    const { from, to } = req.query; // Destructure from and to again for demo data
    const demoFlights = [
      {
        id: 'demo-1',
        price: 450,
        currency: 'USD',
        deepLink: 'https://example.com/book',
        airline: 'Emirates',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        arrivalTime: new Date(Date.now() + 86414400).toISOString(),
        duration: '4h 0m',
        stops: 0,
        origin: from || 'DAC',
        destination: to || 'DXB'
      },
      {
        id: 'demo-2',
        price: 320,
        currency: 'USD',
        deepLink: 'https://example.com/book',
        airline: 'Qatar Airways',
        departureTime: new Date(Date.now() + 90000000).toISOString(),
        arrivalTime: new Date(Date.now() + 90018000).toISOString(),
        duration: '5h 0m',
        stops: 1,
        origin: from || 'DAC',
        destination: to || 'DXB'
      },
      {
        id: 'demo-3',
        price: 280,
        currency: 'USD',
        deepLink: 'https://example.com/book',
        airline: 'Indigo',
        departureTime: new Date(Date.now() + 100000000).toISOString(),
        arrivalTime: new Date(Date.now() + 100021600).toISOString(),
        duration: '6h 0m',
        stops: 1,
        origin: from || 'DAC',
        destination: to || 'DXB'
      }
    ];
    res.json(demoFlights);
  }
};

/**
 * Handle Flight Booking
 */
exports.createBooking = async (req, res) => {
  try {
    const { flightData, passengers, totalPrice, userId } = req.body;

    if (!flightData || !passengers || !totalPrice) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const booking = new FlightBooking({
      userId: req.user.id,
      flightData,
      passengers,
      totalPrice
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: 'Server error while booking flight' });
  }
};

/**
 * Get User Bookings
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await FlightBooking.find({ userId: req.user.id }).sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};
