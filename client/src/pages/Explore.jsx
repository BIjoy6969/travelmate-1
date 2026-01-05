import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    MapPin, MessageSquare, ArrowLeft, Globe, Star, Search,
    Heart, Sparkles, Calendar, Plus, Check, Loader2, Wallet,
    ChevronRight, Map as MapIcon, X, Maximize2, Layers
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { favoritesService, reviewService } from '../services/api';
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import ReviewSection from '../components/ReviewSection';

// Fix for default marker icons in Leaflet
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
        if (center) {
            map.flyTo(center, zoom, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, zoom, map]);
    return null;
}

const Explore = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialName = searchParams.get('name') || '';
    const initialLat = parseFloat(searchParams.get('lat')) || 0;
    const initialLng = parseFloat(searchParams.get('lng')) || 0;
    const initialId = searchParams.get('id') || '';

    const [destination, setDestination] = useState(initialName ? {
        name: initialName,
        lat: initialLat,
        lng: initialLng,
        place_id: initialId,
        location: initialName
    } : null);

    const [activeTab, setActiveTab] = useState('reviews');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [stats, setStats] = useState({ rating: 'New', count: 0 });
    const [mapCenter, setMapCenter] = useState(initialLat ? [initialLat, initialLng] : [20, 0]);
    const [mapZoom, setMapZoom] = useState(initialLat ? 13 : 3);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (destination?.place_id) {
            checkIfSaved();
            fetchStats();
            setMapCenter([destination.lat, destination.lng]);
            setMapZoom(13);
        }
    }, [destination]);

    const checkIfSaved = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const res = await favoritesService.getAll();
            const saved = res.data.find(f => f.destinationId === destination.place_id);
            setIsSaved(!!saved);
        } catch (err) {
            console.error("Check saved failed", err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await reviewService.getStats(destination.place_id);
            setStats({
                rating: res.data.averageRating || 'New',
                count: res.data.reviewCount
            });
        } catch (err) {
            console.error("Stats fetch failed", err);
        }
    };

    const handleSaveToFavorites = async () => {
        if (!destination) return;

        if (!localStorage.getItem('token')) {
            alert("Login necessary to save destinations.");
            navigate('/login');
            return;
        }

        setIsSaving(true);
        try {
            await favoritesService.add({
                destinationId: destination.place_id,
                name: destination.name,
                location: destination.location || destination.name,
                lat: destination.lat,
                lng: destination.lng,
                image: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800`
            });
            setIsSaved(true);
            alert('Saved to favorites! Use the Planner to configure your AI trip.');
        } catch (err) {
            console.error("Save failed", err);
            alert('Failed to save destination. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePlaceSelect = (place) => {
        setDestination({
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            place_id: place.place_id,
            location: place.formatted_address
        });
        setSearchParams({
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            id: place.place_id
        });
        setIsSidebarOpen(true);
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
            {/* Sidebar / Info Panel */}
            <div
                className={`flex-shrink-0 w-full md:w-[450px] bg-white h-full z-[1001] shadow-2xl transition-all duration-500 ease-in-out transform flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 absolute md:relative'
                    }`}
            >
                {/* Search Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore.</h2>
                    </div>

                    <div className="relative group">
                        <PlaceAutocomplete
                            onPlaceSelect={handlePlaceSelect}
                            defaultValue={initialName}
                            placeholder="Where to next?"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                    {!destination ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-20 h-20 bg-brand-50 text-brand-800 rounded-3xl flex items-center justify-center shadow-inner animate-bounce">
                                <Globe size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900">Your Journey Starts Here</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                    Search for a city, landmark, or hidden gem to see community reviews.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in-faded">
                            {/* Destination Identity */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-4xl font-black text-slate-900 leading-none break-words">
                                        {destination.name}
                                    </h1>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <MapPin size={16} className="text-brand-800" />
                                        {destination.location || 'Global destination'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {isSaved ? (
                                        <button
                                            onClick={() => navigate('/planner')}
                                            className="flex-grow bg-emerald-600/10 text-emerald-700 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-600/20 hover:bg-emerald-600/20 transition-all shadow-sm"
                                        >
                                            <Calendar size={18} /> Plan Trip
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSaveToFavorites}
                                            disabled={isSaving}
                                            className="flex-grow bg-brand-800 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-900 transition-all shadow-lg shadow-brand-200"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
                                            Save Destination
                                        </button>
                                    )}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xl font-black text-slate-900">{stats.rating}</span>
                                        <Star size={16} className={`${stats.rating === 'New' ? 'text-slate-300' : 'text-amber-400 fill-amber-400'}`} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reviews</p>
                                    <p className="text-xl font-black text-slate-900">{stats.count}</p>
                                </div>
                            </div>

                            {/* Reviews Component */}
                            <div className="pt-2">
                                <ReviewSection
                                    destinationId={destination.place_id}
                                    destinationName={destination.name}
                                    onReviewChange={fetchStats}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Toggle for Mobile */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden absolute top-6 right-[-50px] bg-white p-3 rounded-r-2xl shadow-xl z-[1002]"
                >
                    <X size={24} className="text-slate-900" />
                </button>
            </div>

            {/* Mobile Sidebar Re-opener Overlay */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 bg-brand-800 text-white px-6 py-3 rounded-full shadow-2xl z-[1002] font-black flex items-center gap-2 animate-bounce"
                >
                    <MessageSquare size={18} /> Show Reviews
                </button>
            )}

            {/* Map Container */}
            <div className="flex-grow relative h-full bg-slate-100">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    className="w-full h-full z-10"
                    zoomControl={false}
                >
                    {/* Modern Clean Tiles (CartoDB Voyager) */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    <ZoomControl position="bottomright" />
                    <ChangeView center={mapCenter} zoom={mapZoom} />

                    {destination && (
                        <Marker position={[destination.lat, destination.lng]}>
                            <Popup className="premium-popup">
                                <div className="p-1">
                                    <h4 className="font-black text-slate-900">{destination.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{destination.location}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Map Floating UI Overlays */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                    <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-1">
                        <button className="p-3 hover:bg-white rounded-xl text-slate-600 transition-all hover:text-brand-800 tooltip" title="Standard View">
                            <Layers size={20} />
                        </button>
                        <button className="p-3 hover:bg-white rounded-xl text-slate-600 transition-all hover:text-brand-800 tooltip" title="Satellite View">
                            <Globe size={20} />
                        </button>
                    </div>
                </div>

                {/* Experience Banner (Bottom Left) */}
                <div className="absolute bottom-6 left-6 z-20 hidden md:block">
                    <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border border-white/20 shadow-sm">
                        TravelMate Premium Explorer
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;
