import api from './api';

const BASE_URL = '/bookings';

// Define Booking interface based on backend model
export interface BookingData {
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
}

export const createBooking = async (bookingData: BookingData) => {
    const response = await api.post(`${BASE_URL}`, bookingData);
    return response.data;
};

export const getUserBookings = async () => {
    const response = await api.get(`${BASE_URL}`);
    return response.data;
};

export const deleteBooking = async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};
