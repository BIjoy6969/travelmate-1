import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    dashboardService,
    exportService,
    currencyService,
    DEMO_USER_ID,
    tripService
} from "../services/api";
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { Trash2, MapPin, Plane, Calendar, Clock, Download, Globe, CloudSun, DollarSign, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface Destination {
    _id: string;
    place_id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
}

const currencyOptions = [
    { code: "USD", name: "USA", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "UK", flag: "🇬🇧" },
    { code: "CAD", name: "Canada", flag: "🇨🇦" },
    { code: "AUD", name: "Australia", flag: "🇦🇺" },
    { code: "JPY", name: "Japan", flag: "🇯🇵" },
    { code: "CNY", name: "China", flag: "🇨🇳" },
    { code: "INR", name: "India", flag: "🇮🇳" },
    { code: "AED", name: "UAE", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi", flag: "🇸🇦" },
    { code: "BDT", name: "Bangladesh", flag: "🇧🇩" },
];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Stats and DB data
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [dashData, setDashData] = useState<any>(null);

    // UI State
    const [city, setCity] = useState("");
    const [lastSearchedCity, setLastSearchedCity] = useState("");
    const [base, setBase] = useState("USD");
    const [target, setTarget] = useState("BDT");
    const [amount, setAmount] = useState(100);

    const [loading, setLoading] = useState(true);
    const [loadingCur, setLoadingCur] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Currency values
    const [curRate, setCurRate] = useState<number | null>(null);
    const [curResult, setCurResult] = useState<number | null>(null);

    const fmt = (n: number | null) =>
        typeof n === "number"
            ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
            : "—";

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [destRes, dashRes] = await Promise.all([
                api.get('/destinations'),
                dashboardService.getDashboard({
                    userId: user?._id || DEMO_USER_ID,
                    city: city || undefined,
                    base,
                    target
                })
            ]);

            setDestinations(destRes.data);
            setDashData(dashRes.data);
            setBookings(dashRes.data.flights || []);
            setLastUpdated(new Date());

            if (city) {
                setLastSearchedCity(city);
                const dashCurrency = dashRes.data?.currency;
                if (dashCurrency?.rate != null) {
                    setCurRate(dashCurrency.rate);
                    setCurResult(dashCurrency.rate * amount);
                }
            } else {
                setLastSearchedCity("");
                setCurRate(null);
                setCurResult(null);
            }
        } catch (err: any) {
            console.error("Dashboard failed to load", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = () => {
        loadData();
    };

    const handlePlaceSelect = async (place: any) => {
        try {
            const newDest = {
                place_id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                notes: "Saved via TravelMate"
            };

            const { data } = await api.post('/destinations', newDest);
            setDestinations([...destinations, data]);
        } catch (error) {
            console.error("Failed to add destination", error);
        }
    };

    const handleDeleteDest = async (id: string) => {
        if (window.confirm("Are you sure?")) {
            try {
                await api.delete(`/destinations/${id}`);
                setDestinations(destinations.filter(d => d._id !== id));
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const exportPDF = () => {
        exportService.exportPDF({
            userId: user?._id || DEMO_USER_ID,
            city: lastSearchedCity || undefined,
            base,
            target,
            amount
        });
    };

    const stats = useMemo(() => {
        const trips = dashData?.trips?.length ?? 0;
        const totalFlights = bookings.length;
        const totalSpent = Number(dashData?.totalSpent ?? 0);
        return { trips, totalFlights, totalSpent };
    }, [dashData, bookings]);

    const weather = dashData?.weather;
    const weatherTemp = weather?.temperature ?? null;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header & Export */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Travel summary for {user?.name || 'Guest'}</p>
                    </div>
                    <button
                        onClick={exportPDF}
                        className="tm-btn-secondary flex items-center gap-2"
                    >
                        <Download size={18} /> Export Report (PDF)
                    </button>
                </div>

                {/* Hero Search Section */}
                <div className="relative overflow-hidden rounded-2xl bg-blue-600 text-white shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"
                    />

                    <div className="relative p-8 md:p-10">
                        <h2 className="text-center text-2xl font-bold mb-6">Explore & Tools</h2>

                        <div className="bg-white rounded-xl p-4 md:p-6 text-slate-900 shadow-lg grid gap-4 md:grid-cols-12">
                            <div className="md:col-span-4">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Destination</label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="tm-input mt-1"
                                    placeholder="Enter city for weather/rates"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Base Currency</label>
                                <select
                                    className="tm-select mt-1"
                                    value={base}
                                    onChange={(e) => setBase(e.target.value)}
                                >
                                    {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Target Currency</label>
                                <select
                                    className="tm-select mt-1"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                >
                                    {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <button
                                    onClick={handleSearch}
                                    className="tm-btn-primary w-full py-2.5"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snapshots Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats */}
                    <div className="tm-card flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-slate-400">Total Spent</span>
                            <DollarSign size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-3xl font-bold">৳{stats.totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-2">{stats.trips} Trips • {stats.totalFlights} Bookings</div>
                    </div>

                    {/* Weather */}
                    <div className="tm-card bg-sky-50/50 border-sky-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-sky-600">Local Weather</span>
                            <CloudSun size={16} className="text-sky-500" />
                        </div>
                        {weather ? (
                            <>
                                <div className="text-3xl font-bold">{weatherTemp !== null ? `${Math.round(weatherTemp)}°C` : '—'}</div>
                                <div className="text-sm font-medium text-slate-600 capitalize">{weather.description || '—'}</div>
                                <div className="text-xs text-slate-400 mt-1">{lastSearchedCity || weather.city}</div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-400 mt-4">Search a city to see weather.</div>
                        )}
                    </div>

                    {/* AI Insights Quick View */}
                    <div className="tm-card bg-indigo-50/50 border-indigo-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-indigo-600">AI Assistant Insights</span>
                            <Sparkles size={16} className="text-indigo-500" />
                        </div>
                        <div className="text-sm text-slate-600 italic">
                            "Based on your favorites, you might enjoy exploring cultural festivals in Osaka this spring."
                        </div>
                        <Link to="/chat" className="text-xs text-indigo-600 font-bold mt-2 flex items-center gap-1 hover:underline">
                            <MessageSquare size={12} /> Ask AI for more tips
                        </Link>
                    </div>
                </div>

                {/* Bottom Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Saved Places */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="text-emerald-500" /> Saved Places
                            </h2>
                            <Link to="/explore" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                            <div className="mt-6 space-y-3">
                                {destinations.slice(-3).reverse().map(dest => (
                                    <div key={dest._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-bold text-sm">{dest.name}</p>
                                            <p className="text-xs text-slate-500">{dest.address}</p>
                                        </div>
                                        <button onClick={() => handleDeleteDest(dest._id)} className="text-slate-400 hover:text-red-500 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {destinations.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">No places saved yet.</p>}
                            </div>
                        </div>
                    </section>

                    {/* Recent Bookings */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plane className="text-blue-500" /> Active Bookings
                            </h2>
                            <Link to="/bookings" className="text-sm text-blue-600 font-semibold hover:underline">Full History</Link>
                        </div>

                        <div className="space-y-4">
                            {bookings.slice(0, 3).map((booking: any) => (
                                <div key={booking._id} className="tm-card flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Plane size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{booking.flightData?.airline || 'Flight'}</span>
                                            <span className="text-sm font-bold text-emerald-600">${booking.totalPrice}</span>
                                        </div>
                                        <div className="font-bold">{booking.flightData?.origin} → {booking.flightData?.destination}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.flightData?.departureTime).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="tm-panel border-dashed flex flex-col items-center py-8 text-center">
                                    <p className="text-slate-500 font-medium">No active journeys</p>
                                    <Link to="/flights" className="text-sm text-blue-600 mt-2 underline">Book your first flight →</Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
