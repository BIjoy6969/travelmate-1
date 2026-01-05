import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

/**
 * PlaceAutocomplete - Powered by Nominatim (OpenStreetMap)
 */
const PlaceAutocomplete = ({ onPlaceSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const debounceTimer = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchPlaces = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Nominatim Search API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'TravelMate-App'
                    }
                }
            );
            const data = await response.json();

            const formattedResults = data.map(item => ({
                place_id: item.place_id,
                name: item.display_name.split(',')[0],
                formatted_address: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                raw: item
            }));

            setResults(formattedResults);
            setShowDropdown(true);
        } catch (error) {
            console.error("Nominatim Search Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            searchPlaces(value);
        }, 500);
    };

    const handleSelect = (place) => {
        setQuery(place.formatted_address);
        setShowDropdown(false);
        onPlaceSelect(place);
    };

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length >= 3 && setShowDropdown(true)}
                    placeholder="Search any city, country or landmark..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-10 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Loader2 size={18} className="animate-spin" />
                    </div>
                )}
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-80 overflow-y-auto">
                        {results.map((place) => (
                            <button
                                key={place.place_id}
                                onClick={() => handleSelect(place)}
                                className="w-full text-left p-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none group"
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{place.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{place.formatted_address}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data by OpenStreetMap</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaceAutocomplete;
