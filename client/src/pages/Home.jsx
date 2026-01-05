import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../services/api';
import { MapPin, Sparkles, LayoutDashboard, Heart, ArrowRight, Star } from 'lucide-react';

import PlaceAutocomplete from "../components/PlaceAutocomplete";

const Home = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleSearchSelect = (place) => {
        // Redirect to Destinations or Planner with the selected place
        navigate(`/planner?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.name)}`);
    };

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await destinationService.getAll();
                setDestinations(res.data.data);
            } catch (err) {
                console.error("Failed to fetch destinations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000"
                        alt="Hero"
                        className="w-full h-full object-cover brightness-50"
                    />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">
                    <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold tracking-widest uppercase">
                        Discover Your Next Adventure
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                        TRAVEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SMARTER.</span>
                    </h1>
                    <p className="text-xl text-slate-200 max-w-2xl mx-auto font-medium">
                        Your all-in-one AI travel companion for itineraries, budget tracking, and global bookings.
                    </p>

                    <div className="max-w-xl mx-auto mt-12 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl">
                        <PlaceAutocomplete onPlaceSelect={handleSearchSelect} />
                    </div>
                </div>
            </section>

            {/* Info Cards */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                            <MapPin size={24} className="text-brand-800" />
                            <h3 className="text-lg font-bold">1. Search Destination</h3>
                            <p className="text-sm text-minimal-muted">Find any place in the world using our global search powered by OpenStreetMap.</p>
                        </div>
                        <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                            <Heart size={24} className="text-brand-800" />
                            <h3 className="text-lg font-bold">2. Save Favorites</h3>
                            <p className="text-sm text-minimal-muted">Keep track of destinations you love and add personal notes.</p>
                        </div>
                        <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                            <Sparkles size={24} className="text-brand-800" />
                            <h3 className="text-lg font-bold">3. AI Budget & Itinerary</h3>
                            <p className="text-sm text-minimal-muted">Gemini AI generates a day-by-day plan with cost estimates based on your travel style.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations Section */}
            <section className="bg-minimal-surface py-24">
                <div className="max-w-7xl mx-auto px-6 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-minimal-text tracking-tight">Popular Destinations</h2>
                            <p className="text-minimal-muted">Get inspired by the most trending places around the globe.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {destinations.filter(d => d.name).slice(0, 6).map((dest, index) => (
                                <div key={index} className="card-minimal group cursor-pointer overflow-hidden">
                                    <div className="relative h-64 overflow-hidden">
                                        {dest.photo?.images?.large?.url ? (
                                            <img
                                                src={dest.photo.images.large.url}
                                                alt={dest.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium italic">
                                                Image coming soon...
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            {dest.rating || '4.5'}
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2">
                                        <h3 className="text-xl font-bold text-minimal-text flex items-center gap-2">
                                            {dest.name}
                                        </h3>
                                        <p className="text-sm text-minimal-muted flex items-center gap-1">
                                            <MapPin size={14} /> {dest.location_string || 'Global Destination'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
