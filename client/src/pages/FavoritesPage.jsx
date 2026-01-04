import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Trash2, Edit2, MapPin, Search, Plus, Heart, X, Sparkles,
    PlusCircle, Navigation, Calendar, Plane, ChevronRight,
    TrendingUp, Wallet, Coffee, CreditCard, Check, AlertCircle,
    MessageSquare, Map as MapIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import ReviewSection from '../components/ReviewSection';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to update map view
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom]);
    return null;
}

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Dhaka default
    const [mapZoom, setMapZoom] = useState(2);
    const [isSearching, setIsSearching] = useState(false);

    // Trip Planning State
    const [currentFavorite, setCurrentFavorite] = useState(null);
    const [isPlanning, setIsPlanning] = useState(false);
    const [planData, setPlanData] = useState({
        tripStartDate: '',
        tripEndDate: '',
        travelStyle: 'Standard'
    });
    const [planningResults, setPlanningResults] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem('user')) || { userId: '000000000000000000000001' };
    const userId = storedUser.userId;

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const res = await axios.get(`/api/favorites?userId=${userId}`);
            setFavorites(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
        setMapCenter([place.lat, place.lng]);
        setMapZoom(12);
        setIsSearching(true);
    };

    const addToFavorites = async () => {
        if (!selectedPlace) return;
        try {
            await axios.post('/api/favorites', {
                userId,
                destinationId: selectedPlace.place_id,
                name: selectedPlace.name,
                location: selectedPlace.formatted_address,
                lat: selectedPlace.lat,
                lng: selectedPlace.lng,
                image: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800` // Default
            });
            setSelectedPlace(null);
            setIsSearching(false);
            fetchFavorites();
            alert('Added to favorites!');
        } catch (err) {
            alert('Failed to add favorite');
        }
    };

    const removeFavorite = async (id) => {
        if (!window.confirm('Remove from favorites?')) return;
        try {
            await axios.delete(`/api/favorites/${id}`);
            fetchFavorites();
        } catch (err) {
            alert('Failed to remove');
        }
    };

    const startPlanning = (fav) => {
        setCurrentFavorite(fav);
        setIsPlanning(true);
        setPlanningResults(null);
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await axios.post('/api/itinerary/generate', {
                destination: currentFavorite.name,
                days: 3,
                interests: 'sightseeing, food'
            });
            setPlanningResults(res.data);
        } catch (err) {
            alert('AI estimation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-slate-200 bg-white overflow-y-auto p-6 space-y-8 flex flex-col">
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Planner</h1>
                    <p className="text-slate-500 text-sm">Design your perfect trip by searching and saving destinations.</p>
                </div>

                {/* Search Integration (Member 1 powered) */}
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Add Destination</label>
                    <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />

                    {selectedPlace && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div>
                                <p className="font-bold text-slate-900">{selectedPlace.name}</p>
                                <p className="text-xs text-slate-500">{selectedPlace.formatted_address}</p>
                            </div>
                            <button
                                onClick={addToFavorites}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Favorites List */}
                <div className="flex-grow space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Saved Spots</label>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{favorites.length}</span>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                            <Heart size={24} className="mb-2 opacity-50" />
                            <p className="text-xs font-medium">No saved spots yet</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {favorites.map((fav) => (
                                <div key={fav._id} className="group bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all relative">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                            <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">{fav.name}</h4>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{fav.location}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => startPlanning(fav)}
                                                    className="text-[10px] font-bold py-1 px-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1"
                                                >
                                                    <Sparkles size={10} className="text-blue-500" />
                                                    Plan Trip
                                                </button>
                                                <button
                                                    onClick={() => removeFavorite(fav._id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-grow relative z-0">
                <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full" zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ChangeView center={mapCenter} zoom={mapZoom} />

                    {favorites.map((fav) => (
                        <Marker key={fav._id} position={[fav.lat, fav.lng]}>
                            <Popup>
                                <div className="p-2 space-y-2">
                                    <p className="font-bold m-0">{fav.name}</p>
                                    <button
                                        onClick={() => startPlanning(fav)}
                                        className="w-full py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg"
                                    >
                                        Start Trip Plan
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {selectedPlace && (
                        <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
                            <Popup>
                                <p className="font-bold">{selectedPlace.name}</p>
                                <button onClick={addToFavorites} className="text-blue-600 text-xs font-bold">Add to Favorites</button>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Overlays */}
                {isPlanning && currentFavorite && (
                    <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Plan Your Journey</p>
                                    <h2 className="text-2xl font-black text-slate-900">{currentFavorite.name}</h2>
                                </div>
                                <button onClick={() => setIsPlanning(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-8">
                                {!planningResults ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-slate-900 text-sm font-bold"
                                                    value={planData.tripStartDate}
                                                    onChange={e => setPlanData({ ...planData, tripStartDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-slate-900 text-sm font-bold"
                                                    value={planData.tripEndDate}
                                                    onChange={e => setPlanData({ ...planData, tripEndDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Travel Style</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Budget', 'Standard', 'Luxury'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setPlanData({ ...planData, travelStyle: s })}
                                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${planData.travelStyle === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePlanSubmit}
                                            disabled={isGenerating || !planData.tripStartDate || !planData.tripEndDate}
                                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-blue-400" />}
                                            {isGenerating ? 'Analyzing with AI...' : 'Generate AI Budget & Itinerary'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        {/* AI Results */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mb-1">Total Budget</p>
                                                <p className="text-3xl font-black text-slate-900">${planningResults.total_budget || '1250'}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-1">Days</p>
                                                <p className="text-3xl font-black text-slate-900">3</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-left">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Daily breakdown</h4>
                                            <div className="space-y-3">
                                                {planningResults.itinerary?.map((day) => (
                                                    <div key={day.day} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="font-bold text-slate-900">Day {day.day}</p>
                                                            <span className="text-xs font-bold text-slate-400">${day.estimatedCost || '400'}</span>
                                                        </div>
                                                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                                            {(day.activities || ['Sightseeing', 'Resting']).map((act, i) => (
                                                                <li key={i}>{act}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200">
                                            Confirm & Save Trip
                                        </button>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-100">
                                    <ReviewSection destinationId={currentFavorite.destinationId} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
