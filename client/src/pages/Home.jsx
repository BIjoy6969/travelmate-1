import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../services/api';
import { MapPin, Sparkles, LayoutDashboard, Heart, ArrowRight, Star, Globe } from 'lucide-react';


const Home = () => {
    const [destinations, setDestinations] = useState({ community: [], global: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await destinationService.getTrending();
                setDestinations(res.data.data);
            } catch (err) {
                console.error("Failed to fetch destinations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    const handleDestinationClick = (dest) => {
        const params = new URLSearchParams({
            name: dest.name,
            lat: dest.latitude,
            lng: dest.longitude,
            id: dest.location_id
        });
        navigate(`/explore?${params.toString()}`);
    };

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

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <Link
                            to="/explore"
                            className="bg-brand-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-900 transition-all shadow-xl shadow-brand-900/20"
                        >
                            <LayoutDashboard size={18} /> Explore Destinations
                        </Link>
                        {!localStorage.getItem('token') && (
                            <Link
                                to="/login"
                                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                            >
                                Get Started <ArrowRight size={18} />
                            </Link>
                        )}
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

            {/* Trending Section */}
            <section className="bg-minimal-surface py-24">
                <div className="max-w-7xl mx-auto px-6 space-y-24">
                    {/* Global Trends Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-800 bg-brand-50 px-4 py-1 rounded-full border border-brand-100">Across the Globe</span>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Global Trends</h2>
                                <p className="text-slate-500 font-medium">What's trending in travel right now around the world.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {destinations.global?.length > 0 ? (
                                destinations.global.map((dest, index) => (
                                    <DestinationCard key={`glob-${index}`} dest={dest} onClick={() => handleDestinationClick(dest)} sourceBadge="Global" />
                                ))
                            ) : !loading && (
                                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                                    <Globe size={40} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 font-medium italic">Global trends are being updated. Check back soon!</p>
                                </div>
                            )}
                            {loading && Array(3).fill(0).map((_, i) => (
                                <div key={`glob-skeleton-${i}`} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Community Favorites Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1 rounded-full border border-blue-100">TravelMate Picks</span>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Community Favorites</h2>
                                <p className="text-slate-500 font-medium">The most saved and reviewed spots by the TravelMate community.</p>
                            </div>
                            <Link to="/trending" className="text-brand-800 font-bold flex items-center gap-2 hover:gap-3 transition-all group/link">
                                View All Trending <ArrowRight size={18} className="transition-all" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {destinations.community?.map((dest, index) => (
                                <DestinationCard key={`comm-${index}`} dest={dest} onClick={() => handleDestinationClick(dest)} sourceBadge="Community" />
                            ))}
                            {loading && Array(3).fill(0).map((_, i) => (
                                <div key={`comm-skeleton-${i}`} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const DestinationCard = ({ dest, onClick, sourceBadge }) => (
    <div
        onClick={onClick}
        className="card-minimal group cursor-pointer overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-100 bg-white"
    >
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm border border-white/20">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    {dest.rating || '4.5'}
                </div>
                {sourceBadge === 'Community' && (
                    <div className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                        Community
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-800/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                    Click to Explore
                </span>
            </div>
        </div>
        <div className="p-6 space-y-2">
            <h3 className="text-xl font-bold text-minimal-text flex items-center gap-2 group-hover:text-brand-800 transition-colors">
                {dest.name}
            </h3>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-minimal-muted flex items-center gap-1 truncate">
                    <MapPin size={14} className="text-brand-800" /> {dest.location_string || 'Global Destination'}
                </p>
                {sourceBadge === 'Community' && dest.saves !== undefined && (
                    <span className="flex-shrink-0 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 italic">
                        {dest.saves} Saves
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default Home;
