import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ItineraryGenerator from './pages/ItineraryGenerator';
import HotelSearch from './pages/HotelSearch';
import BookingHistory from './pages/BookingHistory';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/itinerary" element={<ItineraryGenerator />} />
                    <Route path="/hotels" element={<HotelSearch />} />
                    <Route path="/bookings" element={<BookingHistory />} />
                </Routes>
            </main>
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2024 TravelMate. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;
