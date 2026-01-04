import React, { useState } from 'react';
import axios from 'axios';
import { Star, MapPin } from 'lucide-react';

const HotelSearch = () => {
    const [location, setLocation] = useState('');
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);

    const searchHotels = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.get('/api/hotels/search', {
                params: { location }
            });
            setHotels(res.data);
        } catch (err) {
            console.error(err);
            alert('Error searching hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (hotel) => {
        if (!confirm(`Book ${hotel.hotel_name} for roughly $${hotel.min_total_price || '100'}?`)) return;

        try {
            /* 
               In a real app, we'd have a checkout page. 
               Here we instantly book for "Guest" with hardcoded dates.
            */
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            await axios.post('/api/bookings', {
                userId: 'guest_123',
                hotelId: hotel.hotel_id,
                hotelName: hotel.hotel_name,
                location: location,
                checkIn: today,
                checkOut: tomorrow,
                price: hotel.min_total_price || 150, // Fallback price
                guests: 1
            });

            alert('Booking Successful! Check "My Bookings".');
        } catch (err) {
            console.error(err);
            alert('Booking failed');
        }
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Find Hotels</h2>
                <form onSubmit={searchHotels} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Where used to go? (e.g. Paris)"
                        className="flex-grow border border-gray-300 p-2 rounded-md"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700">
                        Search
                    </button>
                </form>
            </div>

            {loading && <div className="text-center">Searching hotels...</div>}

            <div className="space-y-4">
                {hotels.map((hotel, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
                        <img
                            src={hotel.main_photo_url || 'https://via.placeholder.com/300x200'}
                            alt={hotel.hotel_name}
                            className="w-full md:w-64 h-40 object-cover rounded-md"
                        />
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold">{hotel.hotel_name}</h3>
                            <p className="text-gray-500 flex items-center text-sm">
                                <MapPin size={14} className="mr-1" /> {hotel.address || location}
                            </p>
                            <div className="flex items-center mt-2 text-yellow-500">
                                <Star size={16} fill="currentColor" />
                                <span className="ml-1 text-gray-700 font-semibold">{hotel.class || 4} Stars</span>
                            </div>
                            <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                                {/* Description might not be available in simple search result from RapidAPI */}
                                Experience luxury and comfort at {hotel.hotel_name}.
                            </p>
                        </div>
                        <div className="flex flex-col justify-between items-end min-w-[150px]">
                            <div className="text-right">
                                <p className="text-gray-400 text-xs">Per Night</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {hotel.currency_code} {Math.round(hotel.min_total_price) || 150}
                                </p>
                            </div>
                            <button
                                onClick={() => handleBook(hotel)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelSearch;
