import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, MapPin, Calendar, Settings, LogOut, Loader2 } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.userId) {
                    const res = await axios.get(`/api/auth/profile/${storedUser.userId}`);
                    setUser(res.data);
                }
            } catch (err) {
                console.error('Profile fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-800" size={48} />
        </div>
    );

    if (!user) return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-10 rounded-2xl border border-minimal-border shadow-minimal-sm text-center space-y-4">
                <h2 className="text-xl font-bold">Session Expired</h2>
                <p className="text-minimal-muted">Please log in to view your profile and manage your trips.</p>
                <Link to="/login" className="btn-minimal-primary inline-block">Sign In</Link>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-minimal-border shadow-minimal-sm flex flex-col md:flex-row items-center gap-8">
                <div className="h-24 w-24 bg-brand-100 rounded-full flex items-center justify-center text-brand-800">
                    <User size={48} />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h1 className="text-3xl font-bold text-minimal-text">{user.name}</h1>
                    <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-minimal-muted">
                        <span className="flex items-center gap-1"><Mail size={16} /> {user.email}</span>
                        <span className="flex items-center gap-1"><MapPin size={16} /> {user.location || 'Global Explorer'}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="btn-minimal-secondary p-2 group" title="Settings">
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                    <button onClick={handleLogout} className="btn-minimal-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="tm-panel bg-white space-y-4">
                    <h3 className="text-lg font-bold">Trip Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-minimal-surface rounded-xl">
                            <p className="text-xs text-minimal-muted uppercase font-bold tracking-wider">Status</p>
                            <p className="text-2xl font-bold text-green-600">Active</p>
                        </div>
                        <div className="p-4 bg-minimal-surface rounded-xl">
                            <p className="text-xs text-minimal-muted uppercase font-bold tracking-wider">Member</p>
                            <p className="text-2xl font-bold">Silver</p>
                        </div>
                    </div>
                </div>
                <div className="tm-panel bg-white space-y-4">
                    <h3 className="text-lg font-bold">Account Security</h3>
                    <div className="space-y-3">
                        <p className="text-sm text-minimal-muted underline cursor-pointer hover:text-brand-800">Change Password</p>
                        <p className="text-sm text-minimal-muted underline cursor-pointer hover:text-brand-800">Two-Factor Authentication</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
