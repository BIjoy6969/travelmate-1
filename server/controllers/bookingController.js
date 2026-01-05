const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { hotelId, hotelName, location, checkIn, checkOut, price, guests } = req.body;

        const newBooking = new Booking({
            userId: req.user.id,
            hotelId,
            hotelName,
            location,
            checkIn,
            checkOut,
            price,
            guests
        });

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking' });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ bookedAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error cancelling booking' });
    }
};
