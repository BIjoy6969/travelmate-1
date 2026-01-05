const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: String,
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    guests: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled'],
        default: 'booked'
    },
    bookedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
