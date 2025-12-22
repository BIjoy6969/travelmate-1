import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Navigation className="h-8 w-8 text-blue-500 mr-2" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                Travelmate
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/trips" className="text-gray-300 hover:text-white transition-colors">
                            Trips
                        </Link>
                        <Link to="/explore" className="text-gray-300 hover:text-white transition-colors">
                            Explore
                        </Link>
                        <Link to="/favorites" className="text-gray-300 hover:text-white transition-colors">
                            Favorites
                        </Link>
                        <Link to="/budget" className="text-gray-300 hover:text-white transition-colors">
                            Budget
                        </Link>
                        <Link to="/chat" className="text-gray-300 hover:text-white transition-colors">
                            AI Chat
                        </Link>
                        <Link to="/weather" className="text-gray-300 hover:text-white transition-colors">
                            Weather
                        </Link>
                        <Link to="/profile" className="text-gray-300 hidden md:block hover:text-white transition-colors">
                            Welcome, {user?.name}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors border border-gray-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
