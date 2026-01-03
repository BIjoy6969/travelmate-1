import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, Hotel, History } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                    <Map /> TravelMate
                </Link>
                <div className="flex gap-6">
                    <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
                        <Map size={18} /> Top Destinations
                    </Link>
                    <Link to="/itinerary" className="hover:text-blue-200 flex items-center gap-1">
                        <Calendar size={18} /> AI Planner
                    </Link>
                    <Link to="/hotels" className="hover:text-blue-200 flex items-center gap-1">
                        <Hotel size={18} /> Hotels
                    </Link>
                    <Link to="/bookings" className="hover:text-blue-200 flex items-center gap-1">
                        <History size={18} /> My Bookings
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
