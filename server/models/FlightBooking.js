const mongoose = require('mongoose');

const flightBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightData: {
    airline: { type: String, required: true },
    flightNumber: { type: String },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    duration: { type: String },
    stops: { type: Number, default: 0 },
    deepLink: { type: String }
  },
  passengers: {
    type: Number,
    required: true,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FlightBooking', flightBookingSchema);
