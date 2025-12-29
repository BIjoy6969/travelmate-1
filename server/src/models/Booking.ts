import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Schema.Types.ObjectId;
    flightData: {
        airline: string;
        flightNumber?: string;
        departureTime: string;
        arrivalTime: string;
        origin: string;
        destination: string;
        price: number;
        currency: string;
        duration?: string;
        stops?: number;
        deepLink?: string;
    };
    passengers: number;
    totalPrice: number;
    bookingDate: Date;
    status: 'confirmed' | 'cancelled';
}

const BookingSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        deepLink: { type: String },
    },
    passengers: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed',
    },
}, {
    timestamps: true,
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
