import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationService } from '../services/api';
import { MapPin, Star, ArrowLeft, Loader2, Globe, Heart } from 'lucide-react';

const TrendingDestinations = () => {
    const navigate = useNavigate();

    // Community State
    const [communityData, setCommunityData] = useState([]);
    const [commPage, setCommPage] = useState(1);
    const [commHasMore, setCommHasMore] = useState(true);
    const [commLoading, setCommLoading] = useState(false);
    const [commSort, setCommSort] = useState('saves'); // 'saves' or 'stars'

    // Global State
    const [globalData, setGlobalData] = useState([]);
    const [globalPage, setGlobalPage] = useState(1);
    const [globalHasMore, setGlobalHasMore] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);

    const observer = useRef();

    const lastCommElementRef = useCallback(node => {
        if (commLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && commHasMore) {
                setCommPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [commLoading, commHasMore]);

    const lastGlobalElementRef = useCallback(node => {
        if (globalLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && globalHasMore) {
                setGlobalPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [globalLoading, globalHasMore]);

    useEffect(() => {
        loadData('community', commPage, commSort);
    }, [commPage, commSort]);

    useEffect(() => {
        loadData('global', globalPage);
    }, [globalPage]);

    const loadData = async (type, page, sortBy) => {
        if (type === 'community') setCommLoading(true);
        else setGlobalLoading(true);

        try {
            const params = { type, page, limit: 10 };
            if (type === 'community' && sortBy) params.sortBy = sortBy;

            const res = await destinationService.getTrending(params);
            const newData = res.data.data;

            if (type === 'community') {
                if (page === 1) setCommunityData(newData);
                else setCommunityData(prev => [...prev, ...newData]);
                setCommHasMore(newData.length === 10);
            } else {
                setGlobalData(prev => [...prev, ...newData]);
                setGlobalHasMore(newData.length === 10);
            }
        } catch (err) {
            console.error(`Failed to load ${type} data:`, err);
            if (type === 'global') setGlobalHasMore(false);
        } finally {
            if (type === 'community') setCommLoading(false);
            else setGlobalLoading(false);
        }
    };

    const handleSortChange = (newSort) => {
        if (newSort === commSort) return;
        setCommunityData([]);
        setCommPage(1);
        setCommHasMore(true);
        setCommSort(newSort);
    };

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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trending Destinations</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Global Inspiration • Community Picks</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
                {/* Global Trends Section - Static Top Picks */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-100">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Global Trends</h2>
                            <p className="text-slate-500 font-medium">World's most trending destinations right now.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {globalData.map((dest, idx) => (
                            <DestinationCard
                                key={`glob-${idx}`}
                                dest={dest}
                                onClick={() => handleDestinationClick(dest)}
                                sourceBadge="Global"
                            />
                        ))}
                        {globalLoading && Array(4).fill(0).map((_, i) => (
                            <div key={`glob-skeleton-${i}`} className="h-80 bg-slate-100 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                    {!globalLoading && globalData.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <Globe size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium italic">Global trends are being updated. Check back soon!</p>
                        </div>
                    )}
                </section>

                {/* Community Favorites Section - Infinite Scroll at Bottom */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Community Favorites</h2>
                                <p className="text-slate-500 font-medium max-w-md">Sorted by our community's top saves and ratings.</p>
                            </div>
                        </div>

                        {/* Sort Toggle */}
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
                            <button
                                onClick={() => handleSortChange('saves')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${commSort === 'saves' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Most Saved
                            </button>
                            <button
                                onClick={() => handleSortChange('stars')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${commSort === 'stars' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Highest Rated
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {communityData.map((dest, idx) => (
                            <DestinationCard
                                key={`comm-${idx}`}
                                dest={dest}
                                onClick={() => handleDestinationClick(dest)}
                                innerRef={idx === communityData.length - 1 ? lastCommElementRef : null}
                                sourceBadge="Community"
                            />
                        ))}
                    </div>
                    {commLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const DestinationCard = ({ dest, onClick, sourceBadge, innerRef }) => (
    <div
        ref={innerRef}
        onClick={onClick}
        className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
        <div className="relative h-64 overflow-hidden">
            <img
                src={dest.photo?.images?.large?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
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
            <h3 className="text-xl font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {dest.name}
            </h3>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 flex items-center gap-1 truncate font-medium">
                    <MapPin size={14} className="text-blue-600" /> {dest.location_string || 'Global Destination'}
                </p>
                {dest.source === 'Community' && dest.saves !== undefined && (
                    <span className="flex-shrink-0 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 italic">
                        {dest.saves} Saves
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default TrendingDestinations;
