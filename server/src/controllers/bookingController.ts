import { Request, Response } from 'express';
import Booking from '../models/Booking';

// Extend Request interface to include user
interface AuthRequest extends Request {
    user?: any;
}

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { flightData, hotelData, passengers, totalPrice, hotelId, hotelName, location, checkIn, checkOut, price, guests, userId } = req.body;

        // Determine destination of model fields based on what's provided
        let bookingData: any = {
            user: req.user?._id || userId || '651234567890123456789012', // Fallback for demo if needed
            status: 'confirmed'
        };

        if (flightData) {
            bookingData.flightData = flightData;
            bookingData.totalPrice = totalPrice;
        } else if (hotelId || hotelData) {
            // Fariha's format
            bookingData.hotelData = {
                hotelId: hotelId || hotelData?.hotelId,
                hotelName: hotelName || hotelData?.hotelName,
                location: location || hotelData?.location,
                checkIn: checkIn || hotelData?.checkIn,
                checkOut: checkOut || hotelData?.checkOut,
                guests: guests || hotelData?.guests || 1,
                price: price || hotelData?.price || 150
            };
            bookingData.totalPrice = price || hotelData?.price || 150;
            bookingData.status = 'booked';
        } else {
            res.status(400).json({ message: 'Missing required booking fields' });
            return;
        }

        const booking = new Booking(bookingData);
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error while creating booking' });
    }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId || req.user?._id;
        const bookings = await Booking.find({ $or: [{ user: userId }, { user: 'guest_123' }] }).sort({ bookingDate: -1 });
        // Fariha's frontend might expect 'guest_123' if not logged in
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings' });
    }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json(booking);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server error while cancelling booking' });
    }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // Ensure the user owns the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to delete this booking' });
            return;
        }

        await booking.deleteOne();
        res.status(200).json({ message: 'Booking removed' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error while deleting booking' });
    }
};
