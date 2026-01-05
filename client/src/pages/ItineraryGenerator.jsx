import React, { useState } from 'react';
import { itineraryService } from '../services/api';
import { Calendar, CheckCircle } from 'lucide-react';
import PlaceAutocomplete from "../components/PlaceAutocomplete";

const ItineraryGenerator = () => {
    const [formData, setFormData] = useState({ destination: '', days: 3, interests: '' });
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await itineraryService.generate(formData);
            setItinerary(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to generate itinerary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">AI Trip Planner</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8 hidden md:block">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Destination</label>
                        <div className="mt-1">
                            <PlaceAutocomplete onPlaceSelect={(place) => setFormData({ ...formData, destination: place.name })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Days</label>
                        <input
                            type="number"
                            min="1" max="14"
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            value={formData.days}
                            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Interests</label>
                        <input
                            type="text"
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="Food, History, Art..."
                            value={formData.interests}
                            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 font-semibold"
                    >
                        {loading ? 'Generating...' : 'Plan Trip'}
                    </button>
                </form>
            </div>

            {/* Mobile friendly form fallback or just single view */}

            {itinerary && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-indigo-900 border-b pb-2">{itinerary.title || `Trip to ${formData.destination}`}</h2>
                    <div className="grid gap-6">
                        {itinerary.days?.map((day, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <Calendar className="mr-2 text-indigo-500" size={20} />
                                    Day {day.dayNumber}: {day.theme}
                                </h3>
                                <ul className="space-y-2">
                                    {day.activities?.map((activity, actIdx) => (
                                        <li key={actIdx} className="flex items-start">
                                            <CheckCircle className="mr-2 text-green-500 mt-1 flex-shrink-0" size={16} />
                                            <span className="text-gray-700">{activity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItineraryGenerator;
