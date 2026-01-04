import mongoose from "mongoose";

const FlightBookingSchema = new mongoose.Schema({
  userId: String,
  from: String,
  to: String,
  date: String,
  price: Number,
  airline: String,
  bookingRef: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("FlightBooking", FlightBookingSchema);

