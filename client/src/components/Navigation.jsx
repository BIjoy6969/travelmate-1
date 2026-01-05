import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, LayoutDashboard, Sparkles, Calendar, Plane, Hotel, Cloud, Coins, Wallet, Bookmark, User, LogOut, MapPin, TrendingUp } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-[1000] w-full bg-white border-b border-minimal-border py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center">
          <Globe size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-minimal-text">TravelMate</span>
      </Link>

      <div className="hidden lg:flex items-center gap-6">
        <Link to="/explore" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/explore') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Globe size={16} />
          <span>Explore</span>
        </Link>
        <Link to="/trending" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/trending') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <TrendingUp size={16} />
          <span>Trending</span>
        </Link>
        <Link to="/dashboard" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        <Link to="/trips" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/trips') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <MapPin size={16} />
          <span>Trips</span>
        </Link>
        <Link to="/planner" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/planner') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Sparkles size={16} />
          <span>Planner</span>
        </Link>
        <Link to="/flights" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/flights') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Plane size={16} />
          <span>Flights</span>
        </Link>
        <Link to="/hotels" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/hotels') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Hotel size={16} />
          <span>Hotels</span>
        </Link>
        <Link to="/weather" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/weather') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Cloud size={16} />
          <span>Weather</span>
        </Link>
        <Link to="/currency" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/currency') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Coins size={16} />
          <span>Currency</span>
        </Link>
        <Link to="/bookings" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/bookings') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Bookmark size={16} />
          <span>My Bookings</span>
        </Link>
        <Link to="/expenses" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/expenses') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Wallet size={16} />
          <span>Expenses</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-minimal-muted hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-sm font-medium text-minimal-muted hover:text-minimal-text">Sign In</Link>
        )}

        <Link to="/profile" className="w-10 h-10 bg-minimal-surface border border-minimal-border rounded-full flex items-center justify-center text-minimal-muted hover:text-brand-800 transition-colors">
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
