import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.userId);
            localStorage.setItem('user', JSON.stringify(res.data));
            alert('Registration successful!');
            window.location.href = '/dashboard';
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-minimal-border shadow-minimal-sm">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-brand-800 rounded-xl flex items-center justify-center">
                        <Globe className="text-white" size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-minimal-text">Create Account</h2>
                    <p className="mt-2 text-sm text-minimal-muted">Join TravelMate to start planning your next journey</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-minimal-muted" size={18} />
                            <input
                                type="text"
                                required
                                className="input-minimal w-full pl-10"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-minimal-muted" size={18} />
                            <input
                                type="email"
                                required
                                className="input-minimal w-full pl-10"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-minimal-muted" size={18} />
                            <input
                                type="password"
                                required
                                className="input-minimal w-full pl-10"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-minimal-primary w-full py-3 flex items-center justify-center gap-2">
                        Sign Up <ArrowRight size={18} />
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-minimal-muted">Already have an account? </span>
                        <Link to="/login" className="text-brand-800 font-bold hover:underline">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
