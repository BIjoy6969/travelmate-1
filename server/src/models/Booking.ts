import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Schema.Types.ObjectId;
    flightData?: {
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
    hotelData?: {
        hotelId: string;
        hotelName: string;
        location: string;
        checkIn: Date;
        checkOut: Date;
        guests: number;
        price: number;
    };
    totalPrice: number;
    bookingDate: Date;
    status: 'confirmed' | 'cancelled' | 'booked';
}

const BookingSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    flightData: {
        airline: { type: String },
        flightNumber: { type: String },
        departureTime: { type: String },
        arrivalTime: { type: String },
        origin: { type: String },
        destination: { type: String },
        price: { type: Number },
        currency: { type: String, default: 'USD' },
        duration: { type: String },
        stops: { type: Number, default: 0 },
        deepLink: { type: String },
    },
    hotelData: {
        hotelId: { type: String },
        hotelName: { type: String },
        location: { type: String },
        checkIn: { type: Date },
        checkOut: { type: Date },
        guests: { type: Number },
        price: { type: Number },
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
        enum: ['confirmed', 'cancelled', 'booked'],
        default: 'confirmed',
    },
}, {
    timestamps: true,
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
