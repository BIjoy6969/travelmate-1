import React, { useState } from 'react';
import { searchFlights } from '../api/flightService';
import { createBooking } from '../api/bookingService';
import { useAuth } from '../context/AuthContext';
import { Plane, Search, Calendar, Users, Briefcase, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlightsPage = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [loading, setLoading] = useState(false);
    const [flights, setFlights] = useState<any[]>([]);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookingLoading, setBookingLoading] = useState<string | null>(null); // store flight ID being booked

    const handleBooking = async (flight: any) => {
        if (!user) {
            alert("Please login to book a flight.");
            navigate('/login');
            return;
        }

        setBookingLoading(flight.id || flight.deepLink); // Use unique ID

        try {
            const bookingData = {
                flightData: {
                    airline: flight.airline,
                    departureTime: flight.departureTime,
                    arrivalTime: flight.arrivalTime,
                    origin: flight.origin,
                    destination: flight.destination,
                    price: flight.price,
                    currency: 'USD', // Assuming USD for now based on display
                    duration: flight.duration,
                    stops: flight.stops,
                    deepLink: flight.deepLink,
                    flightNumber: flight.flightNumber || 'N/A'
                },
                passengers: passengers,
                totalPrice: flight.price * passengers
            };

            await createBooking(bookingData);
            alert("Flight booked successfully! View it in your dashboard.");
            navigate('/dashboard');
        } catch (err) {
            console.error("Booking failed", err);
            alert("Failed to book flight. Please try again.");
        } finally {
            setBookingLoading(null);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFlights([]);

        try {
            const data = await searchFlights({ from, to, date, adults: passengers });
            // Backend now returns a simplified, flat array of Flight objects
            if (Array.isArray(data)) {
                setFlights(data);
            } else {
                setFlights([]);
                setError('Received unexpected data format from server.');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail?.message || err.response?.data?.message || 'Failed to fetch flights. Please try again.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <Plane className="text-blue-500" /> Flight Search
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">From (IATA Code)</label>
                        <div className="relative">
                            <Plane className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                value={from}
                                onChange={e => setFrom(e.target.value.toUpperCase())}
                                placeholder="e.g. LHR"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                required
                                maxLength={3}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">To (IATA Code)</label>
                        <div className="relative">
                            <Plane className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                value={to}
                                onChange={e => setTo(e.target.value.toUpperCase())}
                                placeholder="e.g. JFK"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                required
                                maxLength={3}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Passengers</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                            <input
                                type="number"
                                value={passengers}
                                onChange={e => setPassengers(parseInt(e.target.value))}
                                min={1}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Search Flights</>}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8 text-center">
                    {error}
                </div>
            )}

            {/* Results */}
            <div className="space-y-4">
                {flights.length > 0 ? (
                    flights.map((flight: any, index: number) => (
                        <div key={flight.id || index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">{flight.airline}</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {flight.departureTime?.split('T')[1]?.slice(0, 5)} - {flight.arrivalTime?.split('T')[1]?.slice(0, 5)}
                                </div>
                                <div className="text-gray-400 text-sm flex gap-4">
                                    <span>{flight.duration}</span>
                                    <span>•</span>
                                    <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                                    <span>•</span>
                                    <span className="text-gray-500">{flight.origin} - {flight.destination}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">
                                    ${flight.price}
                                </div>
                                <a
                                    href={flight.deepLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Select
                                </a>
                                <button
                                    onClick={() => handleBooking(flight)}
                                    disabled={!!bookingLoading}
                                    className={`mt-2 ml-2 inline-block ${bookingLoading === (flight.id || flight.deepLink) ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
                                >
                                    {bookingLoading === (flight.id || flight.deepLink) ? 'Booking...' : 'Book Now'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <div className="text-center text-gray-500 mt-12">Search for flights to see results here.</div>
                )}
            </div>
        </div>
    );
};

export default FlightsPage;
