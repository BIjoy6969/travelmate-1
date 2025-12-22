import React, { useState } from "react";
import api from "../api/api"; // Using configured axios instance

const WeatherWidget: React.FC = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFetchWeather = async () => {
        if (!city.trim()) {
            setError("Please enter a city or destination name.");
            return;
        }

        setError("");
        setLoading(true);
        setWeather(null);

        try {
            const res = await api.get('/weather', {
                params: { city },
            });

            setWeather(res.data);
        } catch (err) {
            console.error(err);
            setError("Could not fetch weather. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                🌤 Real-time Weather
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter destination (e.g., Dhaka, Paris)"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <button
                    onClick={handleFetchWeather}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Check
                </button>
            </div>

            {loading && <p className="text-center">Loading weather...</p>}

            {error && (
                <p className="text-red-500 text-sm text-center mb-2">{error}</p>
            )}

            {weather && (
                <div className="mt-2 text-center">
                    <p className="text-lg font-semibold">
                        {weather.city}, {weather.country}
                    </p>
                    <p className="text-4xl font-bold my-2">
                        {Math.round(weather.temp)}°C
                    </p>
                    <p className="capitalize text-gray-700">{weather.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Feels like {Math.round(weather.feels_like)}°C • Humidity{" "}
                        {weather.humidity}%
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
