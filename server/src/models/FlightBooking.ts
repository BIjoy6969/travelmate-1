import mongoose, { Document, Schema } from "mongoose";

export interface IFlightBooking extends Document {
    userId: string;
    from: string;
    to: string;
    date: string;
    price: number;
    airline: string;
    bookingRef: string;
    createdAt: Date;
}

const FlightBookingSchema: Schema = new Schema({
    userId: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String, required: true },
    price: { type: Number, required: true },
    airline: { type: String, required: true },
    bookingRef: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFlightBooking>("FlightBooking", FlightBookingSchema);
