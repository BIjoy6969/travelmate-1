import { Request, Response } from 'express';
import Booking from '../models/Booking';

// Extend Request interface to include user
interface AuthRequest extends Request {
    user?: any;
}

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { flightData, passengers, totalPrice } = req.body;

        if (!flightData || !passengers || !totalPrice) {
            res.status(400).json({ message: 'Missing required booking fields' });
            return;
        }

        const booking = new Booking({
            user: req.user._id, // Assumes authMiddleware attaches user object
            flightData,
            passengers,
            totalPrice,
            status: 'confirmed',
        });

        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error while creating booking' });
    }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ bookingDate: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings' });
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
