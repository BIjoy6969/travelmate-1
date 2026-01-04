import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';

const Home = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                // Fetch top destinations from our backend proxy
                const res = await axios.get('http://localhost:5000/api/destinations');
                // The API response structure depends on TripAdvisor. 
                // Assuming it returns an array under 'data' or root.
                // Based on controller, it explicitly returns response.data
                setDestinations(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    return (
        <div className="space-y-6">
            <header className="text-center py-10 bg-blue-50 rounded-lg">
                <h1 className="text-4xl font-bold text-blue-800 mb-2">Explore Top Destinations</h1>
                <p className="text-gray-600">Discover the world's best places to visit.</p>
            </header>

            {loading ? (
                <div className="text-center">Loading destinations...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {destinations.filter(d => d.name).map((dest, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                            {dest.photo?.images?.large?.url ? (
                                <img
                                    src={dest.photo.images.large.url}
                                    alt={dest.name}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-xl font-semibold flex items-center gap-1">
                                    <MapPin size={16} className="text-blue-500" /> {dest.name}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">{dest.location_string}</p>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Rating: {dest.rating || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
