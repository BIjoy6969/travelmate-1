import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { Trash2, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Destination {
    _id: string;
    place_id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDestinations = async () => {
        try {
            const { data } = await api.get('/destinations');
            setDestinations(data);
        } catch (error) {
            console.error("Failed to fetch destinations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    const handlePlaceSelect = async (place: any) => {
        try {
            const newDest = {
                place_id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                notes: "Saved via TravelMate"
            };

            const { data } = await api.post('/destinations', newDest);
            setDestinations([...destinations, data]);
        } catch (error) {
            console.error("Failed to add destination", error);
            alert("Failed to save destination.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this destination?")) {
            try {
                await api.delete(`/destinations/${id}`);
                setDestinations(destinations.filter(d => d._id !== id));
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Search Section */}
                <section className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Add New Destination</h2>
                    <div className="relative">
                        <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                    </div>
                    <p className="text-gray-500 text-sm mt-3">
                        Search for a city, landmark, or specific address to add it to your bucket list.
                    </p>
                </section>

                {/* Destinations Grid */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
                        <MapPin className="mr-2 text-emerald-400" /> Your Saved Places
                    </h2>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading your world...</div>
                    ) : destinations.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-400 text-lg">No destinations saved yet.</p>
                            <p className="text-gray-600">Start by searching above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {destinations.map((dest) => (
                                <div key={dest._id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{dest.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{dest.address}</p>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="text-xs text-gray-600 font-mono">
                                                {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(dest._id)}
                                                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                                title="Remove destination"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
