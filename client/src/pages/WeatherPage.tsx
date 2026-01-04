import React from 'react';
import WeatherWidget from "../components/WeatherWidget";
import Navbar from '../components/Navbar';

const WeatherPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
            <Navbar />
            <div className="flex flex-col items-center flex-1">
                <header className="w-full max-w-4xl px-4 py-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        TravelMate – Weather
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Real-time weather details for any destination.
                    </p>
                </header>

                <main className="w-full max-w-4xl px-4">
                    <WeatherWidget />
                </main>
            </div>
        </div>
    );
};

export default WeatherPage;
