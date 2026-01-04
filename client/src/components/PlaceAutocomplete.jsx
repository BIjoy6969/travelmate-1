import React, { useState } from 'react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

/**
 * PlaceAutocomplete - Premium destination search component
 * Powered by Geoapify
 */
const PlaceAutocomplete = ({ onPlaceSelect }) => {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const onPlaceSelectCallback = (value) => {
        if (value && value.properties) {
            const result = {
                place_id: value.properties.place_id,
                formatted_address: value.properties.formatted,
                lat: value.properties.lat,
                lng: value.properties.lon,
                name: value.properties.name || value.properties.street || value.properties.city
            };
            onPlaceSelect(result);
        }
    };

    const [demoQuery, setDemoQuery] = useState('');
    const demoPlaces = [
        { place_id: '1', name: 'Paris, France', formatted_address: 'Paris, Ile-de-France, France', lat: 48.8566, lng: 2.3522 },
        { place_id: '2', name: 'Tokyo, Japan', formatted_address: 'Tokyo, Kanto, Japan', lat: 35.6895, lng: 139.6917 },
        { place_id: '3', name: 'New York, USA', formatted_address: 'New York City, NY, USA', lat: 40.7128, lng: -74.0060 },
        { place_id: '4', name: 'London, UK', formatted_address: 'London, Greater London, UK', lat: 51.5074, lng: -0.1278 },
        { place_id: '5', name: 'Dhaka, Bangladesh', formatted_address: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125 },
        { place_id: '6', name: 'Dubai, UAE', formatted_address: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 }
    ];

    if (!apiKey) {
        const filtered = demoPlaces.filter(p => p.name.toLowerCase().includes(demoQuery.toLowerCase()));
        return (
            <div className="w-full relative">
                <div className="relative">
                    <input
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        placeholder="Search demo (Paris, Tokyo...)"
                        value={demoQuery}
                        onChange={e => setDemoQuery(e.target.value)}
                    />
                    {demoQuery && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                            {filtered.length > 0 ? filtered.map(p => (
                                <button
                                    key={p.place_id}
                                    onClick={() => { onPlaceSelect(p); setDemoQuery(''); }}
                                    className="w-full text-left p-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none"
                                >
                                    <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                                    <p className="text-xs text-slate-500">{p.formatted_address}</p>
                                </button>
                            )) : <div className="p-3 text-xs text-slate-400">No demo match for "{demoQuery}"</div>}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <GeoapifyContext apiKey={apiKey}>
            <div className="geoapify-autocomplete-wrapper text-slate-900 custom-geoapify-input w-full">
                <GeoapifyGeocoderAutocomplete
                    placeholder="Search any destination (e.g., Paris, Tokyo)..."
                    placeSelect={onPlaceSelectCallback}
                />
            </div>
            <style>{`
                .custom-geoapify-input .geoapify-autocomplete-input {
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    background-color: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .custom-geoapify-input .geoapify-autocomplete-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .geoapify-autocomplete-items {
                    background-color: white;
                    border: 1px solid #e2e8f0;
                    color: #1e293b;
                    border-radius: 0.75rem;
                    margin-top: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .geoapify-autocomplete-item {
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                }
                .geoapify-autocomplete-item:hover {
                    background-color: #f8fafc;
                }
            `}</style>
        </GeoapifyContext>
    );
};

export default PlaceAutocomplete;
