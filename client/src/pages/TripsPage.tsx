import React, { useEffect, useState } from 'react';
import { tripService } from '../services/api';
import TripForm from '../components/TripForm';
import Navbar from '../components/Navbar';

const TripsPage: React.FC = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await tripService.getAll();
            setTrips(res.data);
        } catch (error) {
            console.error('Failed to fetch trips', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (tripData: any) => {
        await tripService.create(tripData);
        setShowForm(false);
        fetchTrips();
    };

    const handleUpdate = async (tripData: any) => {
        if (editingTrip) {
            await tripService.update(editingTrip._id, tripData);
            setEditingTrip(null);
            fetchTrips();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this trip?')) {
            await tripService.delete(id);
            fetchTrips();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
                    {!showForm && !editingTrip && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow"
                        >
                            + Plan New Trip
                        </button>
                    )}
                </div>

                {(showForm || editingTrip) && (
                    <div className="mb-8 max-w-2xl mx-auto">
                        <TripForm
                            existingTrip={editingTrip}
                            onSave={editingTrip ? handleUpdate : handleCreate}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingTrip(null);
                            }}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="text-center">Loading trips...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <div key={trip._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">{trip.destination}</h3>
                                    <div className="text-gray-600 mb-4 text-sm">
                                        <p>📅 {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                                        <p>👥 {trip.tripType.charAt(0).toUpperCase() + trip.tripType.slice(1)} Trip</p>
                                    </div>
                                    {trip.notes && (
                                        <p className="text-gray-700 mb-4 bg-gray-50 p-2 rounded text-sm">{trip.notes}</p>
                                    )}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setEditingTrip(trip)}
                                            className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(trip._id)}
                                            className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {trips.length === 0 && !showForm && (
                            <div className="col-span-full text-center text-gray-500 py-12">
                                You haven't planned any trips yet. Start by creating one!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
