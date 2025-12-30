import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, MapPin, Search, Plus, Heart, X, Sparkles, PlusCircle, Navigation, Calendar, Plane, ChevronRight, TrendingUp, Wallet, Coffee, CreditCard, Check, AlertCircle, MessageSquare } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering/zooming
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 13, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [currentFavorite, setCurrentFavorite] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapCenter, setMapCenter] = useState([20, 0]);
    const [mapZoom, setMapZoom] = useState(2);

    // Trip Planning State (Module 1 + 2 Synergy)
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [tripDates, setTripDates] = useState({ start: '', end: '' });
    const [travelStyle, setTravelStyle] = useState('Standard');
    const [customPrompt, setCustomPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [notification, setNotification] = useState(null);

    // Reviews State (Module 3)
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null); // { id, name }

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
    };

    const USER_ID = 'test-user-1';

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/favorites/${USER_ID}`);
            const data = await res.json();
            setFavorites(data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            setSearchResults(data.map(item => ({
                id: item.place_id,
                name: item.display_name.split(',')[0],
                location: item.display_name.split(',').slice(1).join(',').trim(),
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
            })));
        } catch (error) {
            console.error("Nominatim Search Error:", error);
        }
    };

    const selectSearchResult = (result) => {
        setMapCenter([result.lat, result.lng]);
        setMapZoom(12);
        setSearchQuery(result.name);
        setSearchResults([]);
        setSelectedDestination(result);
        setCurrentFavorite({ ...result, isNew: true });
    };

    const addFavorite = async (result) => {
        try {
            // Build the request body - include plan data if available
            const requestBody = {
                userId: USER_ID,
                destinationId: result.id?.toString() || Date.now().toString(),
                name: result.name,
                image: result.image,
                location: result.location,
                lat: result.lat,
                lng: result.lng
            };

            // If we have an AI result, include the plan data
            if (aiResult) {
                requestBody.travelStyle = travelStyle;
                requestBody.totalBudget = aiResult.totalEstimatedCost;
                requestBody.estimatedBreakdown = aiResult.breakdown;
                requestBody.tripStartDate = tripDates.start;
                requestBody.tripEndDate = tripDates.end;
                requestBody.itinerary = aiResult.itinerary;
            }

            const res = await fetch('http://localhost:5000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (res.ok) {
                fetchFavorites();
                setSearchQuery('');
                setCurrentFavorite(null);
                setSelectedDestination(null);
                setAiResult(null);
                setAiResult(null);
                showNotification('success', aiResult ? "Trip plan saved!" : "Destination saved!");
            } else {
                const errorData = await res.json();
                console.error("Failed to save favorite:", errorData);
                showNotification('error', "Error saving: " + (errorData.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error adding favorite:", error);
            showNotification('error', "Error saving. Check console for details.");
        }
    };

    const removeFavorite = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/favorites/${id}`, { method: 'DELETE' });
            setFavorites(favorites.filter(fav => fav._id !== id));
        } catch (error) {
            console.error("Error deleting favorite:", error);
        }
    };


    const focusFavorite = (fav) => {
        setMapCenter([fav.lat, fav.lng]);
        setMapZoom(14);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- TRIP PLANNING (Module 1 + 2 Synergy) ---
    const openTripPlanner = async (destination) => {
        setSelectedDestination(destination);
        setIsTripModalOpen(true);
        setCustomPrompt('');

        // If this is an existing favorite with plan data, load it directly
        if (destination._id && destination.itinerary && destination.itinerary.length > 0) {
            setAiResult({
                totalEstimatedCost: destination.totalBudget,
                breakdown: destination.estimatedBreakdown,
                itinerary: destination.itinerary
            });
            if (destination.tripStartDate && destination.tripEndDate) {
                setTripDates({
                    start: new Date(destination.tripStartDate).toISOString().split('T')[0],
                    end: new Date(destination.tripEndDate).toISOString().split('T')[0]
                });
            } else {
                setTripDates({ start: '', end: '' });
            }
            setTravelStyle(destination.travelStyle || 'Standard');
        } else {
            // New destination or no plan yet
            setAiResult(null);
            setTripDates({ start: '', end: '' });
            setTravelStyle('Standard');
        }
    };

    const generateTripPlan = async () => {
        if (!selectedDestination || !tripDates.start || !tripDates.end) return;
        setIsGenerating(true);
        try {
            const res = await fetch('http://localhost:5000/api/budget/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: selectedDestination.name,
                    travelStyle: travelStyle,
                    tripStartDate: tripDates.start,
                    tripEndDate: tripDates.end,
                    customPrompt: customPrompt
                })
            });
            const data = await res.json();
            setAiResult(data);
        } catch (error) {
            console.error("AI Generation Error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const saveTripBudget = async () => {
        if (!aiResult || !selectedDestination) {
            console.error("Cannot save: No AI result or destination selected");
            return;
        }

        try {
            // If this is an existing favorite, update it (PATCH)
            // Otherwise, create a new one (POST)
            const isExistingFavorite = selectedDestination._id;
            const url = isExistingFavorite
                ? `http://localhost:5000/api/favorites/${selectedDestination._id}`
                : 'http://localhost:5000/api/favorites';
            const method = isExistingFavorite ? 'PATCH' : 'POST';

            const requestBody = {
                userId: USER_ID,
                destinationId: selectedDestination.destinationId || selectedDestination.id?.toString() || Date.now().toString(),
                name: selectedDestination.name,
                image: selectedDestination.image,
                location: selectedDestination.location,
                lat: selectedDestination.lat,
                lng: selectedDestination.lng,
                travelStyle: travelStyle,
                totalBudget: aiResult.totalEstimatedCost,
                estimatedBreakdown: aiResult.breakdown,
                tripStartDate: tripDates.start,
                tripEndDate: tripDates.end,
                itinerary: aiResult.itinerary
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server error saving:", errorData);
                showNotification('error', "Error saving plan: " + (errorData.message || "Unknown error"));
                return;
            }

            const savedFav = await res.json();
            console.log("Saved successfully:", savedFav);
            setIsTripModalOpen(false);
            fetchFavorites();
            showNotification('success', isExistingFavorite ? "Plan updated!" : "New trip plan saved!");
        } catch (error) {
            console.error("Error saving:", error);
            showNotification('error', "Error saving plan. Check the console for details.");
        }
    };

    // --- HELPERS FOR MANUAL EDITING ---
    const updateBreakdown = (index, field, value) => {
        const newBreakdown = [...(aiResult.breakdown || [])];
        newBreakdown[index] = { ...newBreakdown[index], [field]: field === 'amount' ? Number(value) : value };
        // Recalculate total based on breakdown
        const newTotal = newBreakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setAiResult({ ...aiResult, breakdown: newBreakdown, totalEstimatedCost: newTotal });
    };

    const addBreakdownItem = () => {
        const newBreakdown = [...(aiResult.breakdown || []), { category: 'Other', amount: 0, description: 'New expense' }];
        setAiResult({ ...aiResult, breakdown: newBreakdown });
    };

    const removeBreakdownItem = (index) => {
        const newBreakdown = [...(aiResult.breakdown || [])];
        newBreakdown.splice(index, 1);
        const newTotal = newBreakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setAiResult({ ...aiResult, breakdown: newBreakdown, totalEstimatedCost: newTotal });
    };

    const updateItineraryCost = (dayIndex, value) => {
        const newItinerary = [...(aiResult.itinerary || [])];
        newItinerary[dayIndex].estimatedCost = Number(value);
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    const updateActivity = (dayIndex, actIndex, value) => {
        const newItinerary = [...(aiResult.itinerary || [])];
        newItinerary[dayIndex].activities[actIndex] = value;
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    const addActivity = (dayIndex) => {
        const newItinerary = [...(aiResult.itinerary || [])];
        newItinerary[dayIndex].activities.push("New activity");
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    const removeActivity = (dayIndex, actIndex) => {
        const newItinerary = [...(aiResult.itinerary || [])];
        newItinerary[dayIndex].activities.splice(actIndex, 1);
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] border transition-all duration-300 ${notification.type === 'error'
                    ? 'bg-red-50 text-red-900 border-red-100'
                    : 'bg-brand-900 text-white border-transparent'
                    }`}>
                    {notification.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
                {/* Search & Map Sidebar */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-minimal-text">Trip Planner</h1>
                            <p className="text-minimal-muted text-sm">Search a destination, then plan your trip with AI.</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-minimal-muted">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search destination (e.g., Tokyo, Japan)..."
                                className="input-minimal w-full pl-10"
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => setIsSearching(true)}
                            />

                            {isSearching && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-minimal-border rounded-xl shadow-lg z-[2000] overflow-hidden">
                                    {searchResults.map(result => (
                                        <button
                                            key={result.id}
                                            className="w-full flex items-center justify-between p-4 hover:bg-minimal-surface transition-colors text-left"
                                            onClick={() => {
                                                selectSearchResult(result);
                                                setIsSearching(false);
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-minimal-surface rounded-lg flex items-center justify-center">
                                                    <MapPin size={16} className="text-brand-800" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-minimal-text truncate">{result.name}</div>
                                                    <div className="text-xs text-minimal-muted truncate">{result.location}</div>
                                                </div>
                                            </div>
                                            <Navigation size={14} className="text-minimal-muted" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Destination Actions */}
                        {selectedDestination && (
                            <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl space-y-3 animate-in-faded">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-800 rounded-lg flex items-center justify-center">
                                        <MapPin size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-brand-900">{selectedDestination.name}</div>
                                        <div className="text-xs text-brand-700 truncate max-w-[200px]">{selectedDestination.location}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openTripPlanner(selectedDestination)}
                                        className="btn-minimal-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={14} />
                                        Plan Trip with AI
                                    </button>
                                    {selectedDestination?.id && (
                                        <button
                                            onClick={() => addFavorite(selectedDestination)}
                                            className="btn-minimal-secondary py-2.5 px-4 text-xs flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Save
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setReviewTarget({ id: selectedDestination.id, name: selectedDestination.name });
                                            setIsReviewOpen(true);
                                        }}
                                        className="btn-minimal-secondary py-2.5 px-4 text-xs flex items-center gap-1"
                                    >
                                        <MessageSquare size={14} /> Reviews
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow rounded-2xl border border-minimal-border overflow-hidden shadow-sm relative h-[400px] md:h-full z-[500]">
                        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapUpdater center={mapCenter} zoom={mapZoom} />

                            {favorites
                                .filter(fav => fav.lat != null && fav.lng != null && !isNaN(fav.lat) && !isNaN(fav.lng))
                                .map(fav => (
                                    <Marker key={fav._id} position={[fav.lat, fav.lng]}>
                                        <Popup>
                                            <div className="p-1 space-y-2">
                                                <div className="font-bold text-sm">{fav.name}</div>
                                                <div className="text-xs text-minimal-muted">{fav.location}</div>
                                                {fav.image && <img src={fav.image} alt={fav.name} className="w-full h-20 object-cover rounded-md" />}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}

                            {selectedDestination && selectedDestination.lat != null && selectedDestination.lng != null && (
                                <Marker position={[selectedDestination.lat, selectedDestination.lng]}>
                                    <Popup>
                                        <div className="font-bold text-sm">{selectedDestination.name}</div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </div>

                {/* Favorites List Container */}
                <div className="w-full md:w-1/2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Heart size={20} className="text-brand-800 fill-brand-800" />
                            My Favorites ({favorites.length})
                        </h2>
                    </div>

                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {favorites.length === 0 ? (
                            <div className="p-16 border-2 border-dashed border-minimal-border rounded-2xl text-center space-y-3">
                                <div className="w-12 h-12 bg-minimal-surface rounded-full flex items-center justify-center mx-auto">
                                    <Heart size={20} className="text-minimal-muted" />
                                </div>
                                <h2 className="text-lg font-bold">Your list is empty</h2>
                                <p className="text-sm text-minimal-muted">Search for a place on the map to add it to your collection.</p>
                            </div>
                        ) : (
                            favorites.map((fav) => (
                                <div key={fav._id} className="card-minimal flex items-center p-4 gap-4 group hover:border-brand-300">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={fav.image} alt={fav.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                                    </div>

                                    <div className="flex-grow min-w-0 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-minimal-text truncate">{fav.name}</h3>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => focusFavorite(fav)}
                                                    className="p-1.5 text-minimal-muted hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors"
                                                    title="View on Map"
                                                >
                                                    <MapPin size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openTripPlanner(fav)}
                                                    className="p-1.5 text-minimal-muted hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors"
                                                    title="Edit Plan"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => removeFavorite(fav._id)}
                                                    className="p-1.5 text-minimal-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReviewTarget({ id: fav.destinationId || fav.id, name: fav.name });
                                                        setIsReviewOpen(true);
                                                    }}
                                                    className="p-1.5 text-minimal-muted hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors"
                                                    title="Reviews"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-minimal-muted truncate pr-2">{fav.location}</p>
                                            {fav.planNumber && (
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                                                    Plan {fav.planNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Note Modal */}

            {/* Review Modal */}
            {isReviewOpen && reviewTarget && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[3000] animate-in-faded">
                    <div className="absolute inset-0 bg-brand-900/20 backdrop-blur-sm" onClick={() => setIsReviewOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 border border-minimal-border shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-minimal-border bg-minimal-surface flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-minimal-text">Reviews</h3>
                                <p className="text-xs text-minimal-muted">{reviewTarget.name}</p>
                            </div>
                            <button onClick={() => setIsReviewOpen(false)} className="text-minimal-muted hover:text-minimal-text transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <ReviewSection
                                destinationId={reviewTarget.id}
                                destinationName={reviewTarget.name}
                                onClose={() => setIsReviewOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Trip Planning Modal (Module 1 + 2 Synergy) */}
            {isTripModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[3000] animate-in-faded">
                    <div className="absolute inset-0 bg-brand-900/20 backdrop-blur-sm" onClick={() => setIsTripModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 border border-minimal-border shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-minimal-border bg-minimal-surface flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-800 rounded-lg flex items-center justify-center">
                                    <Plane size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-minimal-text">Plan Your Trip</h3>
                                    <p className="text-xs text-minimal-muted">{selectedDestination?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsTripModalOpen(false)} className="text-minimal-muted hover:text-minimal-text transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {!aiResult ? (
                                // Step 1: Configure Trip
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted flex items-center gap-1"><Calendar size={12} /> Start Date</label>
                                            <input
                                                type="date"
                                                value={tripDates.start}
                                                onChange={(e) => setTripDates({ ...tripDates, start: e.target.value })}
                                                className="input-minimal w-full"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted flex items-center gap-1"><Calendar size={12} /> End Date</label>
                                            <input
                                                type="date"
                                                value={tripDates.end}
                                                onChange={(e) => setTripDates({ ...tripDates, end: e.target.value })}
                                                className="input-minimal w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted">Travel Style</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Budget', 'Standard', 'Luxury'].map((style) => (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => setTravelStyle(style)}
                                                    className={`p-4 rounded-xl border text-center transition-all ${travelStyle === style ? 'border-brand-800 bg-brand-50 text-brand-800' : 'border-minimal-border hover:border-brand-300'}`}
                                                >
                                                    <div className="text-sm font-bold">{style}</div>
                                                    <div className="text-[10px] text-minimal-muted mt-1">
                                                        {style === 'Budget' && 'Hostels & Local'}
                                                        {style === 'Standard' && 'Mid-range Hotels'}
                                                        {style === 'Luxury' && 'Premium Experience'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted flex items-center gap-1">Custom Requirements (Optional)</label>
                                        <textarea
                                            value={customPrompt}
                                            onChange={(e) => setCustomPrompt(e.target.value)}
                                            placeholder="e.g., I love art museums and vegetarian food. No hiking please."
                                            className="input-minimal w-full h-24 resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={generateTripPlan}
                                        disabled={isGenerating || !tripDates.start || !tripDates.end}
                                        className="btn-minimal-primary w-full py-4 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Gemini is thinking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                <span>Generate Budget & Itinerary</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                // Step 2: Show AI Results
                                <div className="space-y-6 animate-in-faded">
                                    {/* Total Budget */}
                                    <div className="p-6 bg-brand-900 text-white rounded-xl">
                                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Total Estimated Budget</div>
                                        <div className="text-4xl font-bold">${aiResult.totalEstimatedCost?.toLocaleString()}</div>
                                        <div className="text-xs opacity-70 mt-1">{travelStyle} style for {selectedDestination?.name}</div>
                                    </div>

                                    {/* Editable Cost Breakdown */}
                                    {aiResult.breakdown && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-bold uppercase tracking-widest text-minimal-muted flex items-center gap-1"><TrendingUp size={12} /> Cost Breakdown</div>
                                                <button onClick={addBreakdownItem} className="text-[10px] font-bold text-brand-800 flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded">
                                                    <Plus size={10} /> Add Item
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {aiResult.breakdown.map((item, idx) => (
                                                    <div key={idx} className="p-3 bg-minimal-surface rounded-xl border border-minimal-border flex items-start gap-3">
                                                        <div className="flex-grow space-y-2">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    value={item.category}
                                                                    onChange={(e) => updateBreakdown(idx, 'category', e.target.value)}
                                                                    className="input-minimal py-1 px-2 text-sm font-bold w-1/3"
                                                                    placeholder="Category"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={item.amount}
                                                                    onChange={(e) => updateBreakdown(idx, 'amount', e.target.value)}
                                                                    className="input-minimal py-1 px-2 text-sm font-bold w-1/3 text-right"
                                                                    placeholder="Amount"
                                                                />
                                                            </div>
                                                            <input
                                                                value={item.description}
                                                                onChange={(e) => updateBreakdown(idx, 'description', e.target.value)}
                                                                className="input-minimal py-1 px-2 text-xs w-full text-minimal-muted"
                                                                placeholder="Description"
                                                            />
                                                        </div>
                                                        <button onClick={() => removeBreakdownItem(idx)} className="p-2 text-minimal-muted hover:text-red-500 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Editable Itinerary */}
                                    {aiResult.itinerary && (
                                        <div className="space-y-3">
                                            <div className="text-xs font-bold uppercase tracking-widest text-minimal-muted flex items-center gap-1"><Calendar size={12} /> Itinerary Editor</div>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {aiResult.itinerary.map((day, idx) => (
                                                    <div key={idx} className="p-4 bg-white rounded-xl border border-minimal-border space-y-3">
                                                        <div className="flex justify-between items-center bg-brand-50/50 p-2 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-brand-800 rounded-lg flex flex-col items-center justify-center text-white">
                                                                    <span className="text-[8px] font-bold uppercase">Day</span>
                                                                    <span className="text-sm font-bold leading-none">{day.day}</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-brand-900">Day {day.day} Plan</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-minimal-muted">Est. Cost: $</span>
                                                                <input
                                                                    type="number"
                                                                    value={day.estimatedCost}
                                                                    onChange={(e) => updateItineraryCost(idx, e.target.value)}
                                                                    className="input-minimal py-1 px-2 w-20 text-right font-bold text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 pl-4 border-l-2 border-brand-100/50">
                                                            {day.activities.map((activity, aIdx) => (
                                                                <div key={aIdx} className="flex items-start gap-2 group">
                                                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-300 flex-shrink-0"></div>
                                                                    <textarea
                                                                        value={activity}
                                                                        onChange={(e) => updateActivity(idx, aIdx, e.target.value)}
                                                                        className="input-minimal py-1.5 px-3 text-xs w-full resize-none min-h-[36px] bg-transparent focus:bg-white transition-colors"
                                                                        rows={1}
                                                                    />
                                                                    <button
                                                                        onClick={() => removeActivity(idx, aIdx)}
                                                                        className="p-1.5 text-minimal-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => addActivity(idx)}
                                                                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium py-1 px-2 rounded hover:bg-brand-50 transition-colors w-fit"
                                                            >
                                                                <PlusCircle size={14} /> Add Activity
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-minimal-border">
                                        <button onClick={saveTripBudget} className="btn-minimal-primary flex-1 py-3 flex items-center justify-center gap-2">
                                            <Sparkles size={16} />
                                            Save & Update Plan
                                        </button>
                                        <button
                                            onClick={() => setAiResult(null)}
                                            className="btn-minimal-secondary px-6 py-3 text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default FavoritesPage;

