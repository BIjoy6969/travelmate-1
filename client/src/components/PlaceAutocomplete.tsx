import React from 'react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

interface PlaceResult {
    place_id: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
    name: string;
}

interface PlaceAutocompleteProps {
    onPlaceSelect: (place: PlaceResult) => void;
}

const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({ onPlaceSelect }) => {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const onPlaceSelectCallback = (value: any) => {
        if (value && value.properties) {
            // Map Geoapify format to our internal format to avoid breaking Dashboard.tsx
            const result: PlaceResult = {
                place_id: value.properties.place_id,
                formatted_address: value.properties.formatted,
                geometry: {
                    location: {
                        lat: () => value.properties.lat,
                        lng: () => value.properties.lon,
                    }
                },
                name: value.properties.name || value.properties.street || value.properties.city
            };
            onPlaceSelect(result);
        }
    };

    if (!apiKey) {
        return <div className="text-red-500">Missing Geoapify API Key</div>;
    }

    return (
        <GeoapifyContext apiKey={apiKey}>
            <div className="geoapify-autocomplete-wrapper text-black custom-geoapify-input">
                <GeoapifyGeocoderAutocomplete
                    placeholder="Search for a destination..."
                    placeSelect={onPlaceSelectCallback}
                />
            </div>
            <style>{`
                .custom-geoapify-input .geoapify-autocomplete-input {
                    width: 100%;
                    padding-left: 1.25rem; /* pl-5 */
                    padding-right: 3rem; /* pr-12 */
                    padding-top: 1rem; /* py-4 */
                    padding-bottom: 1rem; /* py-4 */
                    background-color: #111827; /* bg-gray-900 */
                    border: 1px solid #374151; /* border-gray-700 */
                    border-radius: 0.75rem; /* rounded-xl */
                    font-size: 1.125rem; /* text-lg */
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .custom-geoapify-input .geoapify-autocomplete-input::placeholder {
                    color: #6b7280; /* placeholder-gray-500 */
                }
                .custom-geoapify-input .geoapify-autocomplete-input:focus {
                    border-color: #3b82f6; /* focus:border-blue-500 */
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); /* focus:ring-2 */
                }
                .geoapify-autocomplete-items {
                    background-color: #111827;
                    border: 1px solid #374151;
                    color: white;
                    border-radius: 0.5rem;
                    margin-top: 0.5rem;
                }
                .geoapify-autocomplete-item {
                    padding: 0.75rem 1rem;
                }
                .geoapify-autocomplete-item:hover, .geoapify-autocomplete-item.active {
                    background-color: #1f2937;
                }
            `}</style>
        </GeoapifyContext>
    );
};

export default PlaceAutocomplete;
