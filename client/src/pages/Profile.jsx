import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Modal from '../components/Modal';
import {
    User,
    Mail,
    Calendar,
    MapPin,
    Settings,
    LogOut,
    Loader2,
    Shield,
    TrendingUp,
    Check,
    AlertCircle
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showSettings, setShowSettings] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', location: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // UI Feedback
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authService.getProfile();
            setUser(res.data);
            setProfileForm({ name: res.data.name, location: res.data.location || '' });
            setTwoFactorEnabled(res.data.twoFactorEnabled || false);
        } catch (err) {
            console.error('Profile fetch failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const resetFeedback = () => {
        setError('');
        setSuccess('');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        resetFeedback();
        setActionLoading(true);
        try {
            const res = await authService.updateProfile(profileForm);
            setUser(prev => ({ ...prev, ...res.data }));
            localStorage.setItem('user', JSON.stringify(res.data)); // Sync local storage
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                setShowSettings(false);
                resetFeedback();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        resetFeedback();
        setActionLoading(true);
        try {
            await authService.updatePassword(passwordForm);
            setSuccess('Password updated successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '' });
            setTimeout(() => {
                setShowPassword(false);
                resetFeedback();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        resetFeedback();
        setActionLoading(true);
        try {
            const newState = !twoFactorEnabled;
            // Using updateProfile endpoint for now as it handles generic updates
            const res = await authService.updateProfile({ twoFactorEnabled: newState });
            setTwoFactorEnabled(newState);
            setUser(prev => ({ ...prev, twoFactorEnabled: newState }));
            setSuccess(newState ? '2FA Enabled!' : '2FA Disabled!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update 2FA settings');
        } finally {
            setActionLoading(false);
        }
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
                <Link to="/login" className="px-6 py-2 bg-brand-800 text-white rounded-xl font-bold inline-block">Sign In</Link>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
            {/* Header Profile Card */}
            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-minimal-sm flex flex-col md:flex-row items-center gap-10">
                {/* Avatar Icon */}
                <div className="h-32 w-32 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={64} />
                </div>

                {/* Info Section */}
                <div className="flex-grow text-center md:text-left space-y-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-2">
                            <Mail size={16} className="text-slate-300" /> {user.email}
                        </span>
                        <span className="flex items-center gap-2">
                            <MapPin size={16} className="text-slate-300" /> {user.location || 'Global Explorer'}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-300" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { resetFeedback(); setShowSettings(true); }}
                        className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                        title="Settings"
                    >
                        <Settings size={22} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-3 border border-red-50 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                        title="Logout"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>

            {/* Stats and Security Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                {/* Trip Statistics */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-minimal-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Trip Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                            <p className="text-2xl font-black text-green-600">Active</p>
                        </div>
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Member</p>
                            <p className="text-2xl font-black text-slate-900">Silver</p>
                        </div>
                    </div>
                </div>

                {/* Account Security */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-minimal-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Security</h3>
                    <div className="space-y-4 flex flex-col">
                        <button
                            onClick={() => { resetFeedback(); setShowPassword(true); }}
                            className="text-left py-2 px-1 text-slate-500 font-bold hover:text-brand-800 transition-colors flex items-center justify-between group"
                        >
                            <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-brand-800">Change Password</span>
                        </button>
                        <button
                            onClick={() => { resetFeedback(); setShow2FA(true); }}
                            className="text-left py-2 px-1 text-slate-500 font-bold hover:text-brand-800 transition-colors flex items-center justify-between group"
                        >
                            <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-brand-800">Two-Factor Authentication</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Edit Profile Modal */}
            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Edit Profile">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <input
                            type="text"
                            className="input-minimal w-full"
                            value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</label>
                        <input
                            type="text"
                            className="input-minimal w-full"
                            value={profileForm.location}
                            onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                            placeholder="e.g. New York, USA"
                        />
                    </div>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
                    {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-center gap-2"><Check size={16} /> {success}</div>}
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="btn-minimal-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={showPassword} onClose={() => setShowPassword(false)} title="Change Password">
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Password</label>
                        <input
                            type="password"
                            className="input-minimal w-full"
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                        <input
                            type="password"
                            className="input-minimal w-full"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
                    {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-center gap-2"><Check size={16} /> {success}</div>}
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="btn-minimal-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                    </button>
                </form>
            </Modal>

            {/* 2FA Modal */}
            <Modal isOpen={show2FA} onClose={() => setShow2FA(false)} title="Two-Factor Authentication">
                <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Enhanced Security</h4>
                        <p className="text-sm text-slate-500 mt-2">
                            Secure your account with 2FA. When enabled, you'll need to verify your identity when logging in from new devices.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 text-left"><AlertCircle size={16} /> {error}</div>}
                    {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-center gap-2 text-left"><Check size={16} /> {success}</div>}

                    <button
                        onClick={handleToggle2FA}
                        disabled={actionLoading}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${twoFactorEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand-800 text-white hover:bg-brand-900'}`}
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
