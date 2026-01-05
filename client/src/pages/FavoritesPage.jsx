import React, { useState, useEffect, useRef } from 'react';
import api, { favoritesService, budgetService } from '../services/api';
import {
    Trash2, Edit2, MapPin, Search, Plus, Heart, X, Sparkles,
    PlusCircle, Navigation, Calendar, Plane, ChevronRight,
    TrendingUp, Wallet, Coffee, CreditCard, Check, AlertCircle,
    MessageSquare, Map as MapIcon, Loader2, History,
    LayoutDashboard, PieChart as PieIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#334155', '#475569'];

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);

    // Trip Planning State
    const [currentFavorite, setCurrentFavorite] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [planData, setPlanData] = useState({
        tripStartDate: '',
        tripEndDate: '',
        travelStyle: 'Standard',
        customPrompt: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (currentFavorite && currentFavorite.tripStartDate) {
            setPlanData({
                tripStartDate: currentFavorite.tripStartDate.split('T')[0],
                tripEndDate: currentFavorite.tripEndDate?.split('T')[0] || '',
                travelStyle: currentFavorite.travelStyle || 'Standard',
                customPrompt: ''
            });

            if (currentFavorite.itinerary && currentFavorite.itinerary.length > 0) {
                setAiResult({
                    totalEstimatedCost: currentFavorite.totalBudget,
                    breakdown: currentFavorite.estimatedBreakdown || [],
                    itinerary: currentFavorite.itinerary
                });
            }
            fetchBudgetExpenses(currentFavorite.destinationId);
        } else {
            setAiResult(null);
            setExpenses([]);
        }
    }, [currentFavorite]);

    const fetchBudgetExpenses = async (destId) => {
        try {
            const res = await budgetService.getAll();
            const budgetDoc = res.data.find(b => b.destinationId === destId || b.destination === currentFavorite?.name);
            if (budgetDoc) {
                setExpenses(budgetDoc.expenses || []);
            } else {
                setExpenses([]);
            }
        } catch (err) {
            console.error("Error fetching expenses", err);
        }
    };

    const fetchFavorites = async () => {
        try {
            const res = await favoritesService.getAll();
            setFavorites(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    const removeFavorite = async (id) => {
        if (!window.confirm('Remove from favorites?')) return;
        try {
            await favoritesService.remove(id);
            if (currentFavorite?._id === id) setCurrentFavorite(null);
            fetchFavorites();
        } catch (err) {
            alert('Failed to remove');
        }
    };

    const startPlanning = (fav) => {
        setCurrentFavorite(fav);
        setActiveTab('overview');
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await budgetService.generate({
                destination: currentFavorite.name,
                travelStyle: planData.travelStyle,
                tripStartDate: planData.tripStartDate,
                tripEndDate: planData.tripEndDate,
                customPrompt: planData.customPrompt
            });
            setAiResult(res.data);
            setActiveTab('itinerary');
        } catch (err) {
            console.error("AI estimation failed", err);
            alert(err.response?.data?.message || 'AI estimation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const updateBreakdown = (index, field, value) => {
        const newBreakdown = [...aiResult.breakdown];
        newBreakdown[index][field] = field === 'amount' ? Number(value) : value;
        const total = newBreakdown.reduce((sum, item) => sum + item.amount, 0);
        setAiResult({ ...aiResult, breakdown: newBreakdown, totalEstimatedCost: total });
    };

    const removeBreakdownItem = (index) => {
        const newBreakdown = aiResult.breakdown.filter((_, i) => i !== index);
        const total = newBreakdown.reduce((sum, item) => sum + item.amount, 0);
        setAiResult({ ...aiResult, breakdown: newBreakdown, totalEstimatedCost: total });
    };

    const updateItineraryCost = (index, value) => {
        const newItinerary = [...aiResult.itinerary];
        newItinerary[index].estimatedCost = Number(value);
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    const updateActivity = (dayIdx, activityIdx, field, value) => {
        const newItinerary = [...aiResult.itinerary];
        const activity = newItinerary[dayIdx].activities[activityIdx];
        activity[field] = field === 'cost' ? Number(value) : value;

        // Recalculate day cost
        newItinerary[dayIdx].estimatedCost = newItinerary[dayIdx].activities.reduce((sum, a) => sum + (a.cost || 0), 0);

        // Recalculate total cost
        const total = newItinerary.reduce((sum, day) => sum + day.estimatedCost, 0);

        // Sync with breakdown: Adjust "Other" category to maintain consistency
        const newBreakdown = [...aiResult.breakdown];
        const otherIdx = newBreakdown.findIndex(b => b.category === 'Other');
        if (otherIdx !== -1) {
            const restSum = newBreakdown.filter((_, i) => i !== otherIdx).reduce((sum, b) => sum + b.amount, 0);
            newBreakdown[otherIdx].amount = Math.max(0, total - restSum);
        }

        setAiResult({ ...aiResult, itinerary: newItinerary, totalEstimatedCost: total, breakdown: newBreakdown });
    };

    const addActivity = (dayIdx) => {
        const newItinerary = [...aiResult.itinerary];
        newItinerary[dayIdx].activities.push({ name: "New activity...", cost: 0 });
        setAiResult({ ...aiResult, itinerary: newItinerary });
    };

    const removeActivity = (dayIdx, activityIdx) => {
        const newItinerary = [...aiResult.itinerary];
        newItinerary[dayIdx].activities = newItinerary[dayIdx].activities.filter((_, i) => i !== activityIdx);

        // Recalculate day cost
        newItinerary[dayIdx].estimatedCost = newItinerary[dayIdx].activities.reduce((sum, a) => sum + (a.cost || 0), 0);

        // Recalculate total cost
        const total = newItinerary.reduce((sum, day) => sum + day.estimatedCost, 0);

        setAiResult({ ...aiResult, itinerary: newItinerary, totalEstimatedCost: total });
    };

    const saveTripBudget = async () => {
        if (!aiResult) return;
        try {
            console.log("Saving trip plan for:", currentFavorite.name);
            // 1. Update Favorite document
            const favUpdate = await favoritesService.update(currentFavorite._id, {
                totalBudget: aiResult.totalEstimatedCost,
                travelStyle: planData.travelStyle,
                tripStartDate: planData.tripStartDate,
                tripEndDate: planData.tripEndDate,
                estimatedBreakdown: aiResult.breakdown,
                itinerary: aiResult.itinerary
            });

            // 2. Update/Create Budget document
            await budgetService.create({
                destination: currentFavorite.name,
                destinationId: currentFavorite.destinationId,
                totalBudget: aiResult.totalEstimatedCost,
                travelStyle: planData.travelStyle,
                tripStartDate: planData.tripStartDate,
                tripEndDate: planData.tripEndDate,
                estimatedBreakdown: aiResult.breakdown,
                itinerary: aiResult.itinerary,
            });

            alert('Trip plan saved successfully!');

            // 3. Refresh data
            await fetchFavorites();
            // Update current selection to reflect new state
            setCurrentFavorite(favUpdate.data);
        } catch (error) {
            console.error("Save error:", error);
            alert(error.response?.data?.message || "Failed to save trip plan.");
        }
    };

    const chartData = aiResult?.breakdown?.map(item => ({
        name: item.category,
        value: item.amount
    })) || [];

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
            {/* Sidebar List */}
            <div className={`border-r border-slate-200 bg-white overflow-y-auto p-6 space-y-8 flex flex-col transition-all duration-300 ${currentFavorite ? 'w-full md:w-1/3 min-w-[320px] hidden md:flex' : 'w-full md:w-1/3 min-w-[320px]'}`}>
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Planner</h1>
                    <p className="text-slate-500 text-sm">Design your perfect trip by managing your saved destinations.</p>
                </div>

                <div className="flex-grow space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Saved Spots</label>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{favorites.length}</span>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                            <Heart size={32} className="mb-4 opacity-50" />
                            <p className="text-sm font-medium">Your planner is empty</p>
                            <p className="text-xs mt-1">Visit Explore to add spots</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {favorites.map((fav) => (
                                <div key={fav._id}
                                    onClick={() => startPlanning(fav)}
                                    className={`group p-4 rounded-2xl border transition-all cursor-pointer relative ${currentFavorite?._id === fav._id ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white'}`}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                            <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className={`font-bold truncate ${currentFavorite?._id === fav._id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{fav.name}</h4>
                                            <p className={`text-[10px] truncate mt-0.5 font-medium ${currentFavorite?._id === fav._id ? 'text-slate-400' : 'text-slate-500'}`}>{fav.location}</p>
                                        </div>
                                        {currentFavorite?._id !== fav._id && (
                                            <button onClick={(e) => { e.stopPropagation(); removeFavorite(fav._id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {currentFavorite?._id === fav._id && (
                                            <ChevronRight size={18} className="text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Area */}
            <div className="flex-grow overflow-y-auto bg-slate-50">
                {!currentFavorite ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 animate-bounce">
                            <MapIcon size={40} className="text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Select a destination</h2>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm">Pick a spot from your sidebar to start designing your perfect trip itinerary and budget.</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight">{currentFavorite.name}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <MapPin size={18} className="text-brand-800" /> {currentFavorite.location}
                                </p>
                            </div>
                            <button onClick={() => setCurrentFavorite(null)} className="md:hidden p-2 bg-white border border-slate-200 rounded-full">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 gap-8">
                            {['overview', 'itinerary', 'budget'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-brand-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm min-h-[500px] relative overflow-hidden">
                            {isGenerating && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in">
                                    <Loader2 size={48} className="animate-spin text-brand-800 mb-4" />
                                    <p className="font-black text-slate-900 uppercase tracking-widest text-xs">AI is Crafting Your Journey...</p>
                                </div>
                            )}

                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in-faded">
                                    <div className="max-w-xl mx-auto text-center space-y-4 py-8">
                                        <Sparkles size={40} className="mx-auto text-amber-400" />
                                        <h3 className="text-2xl font-black text-slate-900 italic">Let's Design Your Trip.</h3>
                                        <p className="text-slate-500 text-sm">Tell the AI agent when you're going and what you love.</p>
                                    </div>

                                    <div className="max-w-md mx-auto space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Arrival</label>
                                                <input type="date" className="input-minimal w-full" value={planData.tripStartDate} onChange={e => setPlanData({ ...planData, tripStartDate: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Departure</label>
                                                <input type="date" className="input-minimal w-full" value={planData.tripEndDate} onChange={e => setPlanData({ ...planData, tripEndDate: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Travel Style</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Budget', 'Standard', 'Luxury'].map((s) => (
                                                    <button key={s} onClick={() => setPlanData({ ...planData, travelStyle: s })} className={`py-3 rounded-xl text-sm font-bold border transition-all ${planData.travelStyle === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Preferences</label>
                                            <textarea className="input-minimal w-full text-sm min-h-[100px] resize-none" placeholder="E.g. Foodie, Nightlife enthusiast..." value={planData.customPrompt} onChange={e => setPlanData({ ...planData, customPrompt: e.target.value })} />
                                        </div>
                                        <button onClick={handlePlanSubmit} disabled={!planData.tripStartDate || !planData.tripEndDate} className="w-full py-4 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-100 disabled:opacity-50">
                                            <Sparkles size={20} /> Generate Plan
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'itinerary' && (
                                <div className="space-y-8 animate-in-faded">
                                    {!aiResult ? (
                                        <div className="text-center py-20 text-slate-400 font-medium">No plan generated. Setup your dates in Overview first.</div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Estimated Budget</p>
                                                    <p className="text-3xl font-black text-slate-900">৳{aiResult.totalEstimatedCost}</p>
                                                </div>
                                                <button onClick={saveTripBudget} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 flex items-center gap-2">
                                                    <Check size={18} /> Save All Changes
                                                </button>
                                            </div>

                                            <div className="grid gap-6">
                                                {aiResult.itinerary.map((day, idx) => (
                                                    <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 relative group">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h4 className="font-black text-xl italic tracking-tighter">Day {day.day}</h4>
                                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                                                <span className="text-xs font-bold text-slate-400">৳</span>
                                                                <input type="number" value={day.estimatedCost} onChange={(e) => updateItineraryCost(idx, e.target.value)} className="bg-transparent w-16 text-right font-bold text-sm focus:outline-none" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {day.activities.map((act, aIdx) => (
                                                                <div key={aIdx} className="flex gap-4 items-center group/act bg-white/50 p-2 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                                                                    <div className="w-2 h-2 rounded-full bg-brand-800 shrink-0 mx-2"></div>
                                                                    <input
                                                                        type="text"
                                                                        value={act.name || act}
                                                                        onChange={(e) => updateActivity(idx, aIdx, 'name', e.target.value)}
                                                                        className="flex-grow text-sm text-slate-900 bg-transparent focus:outline-none font-medium"
                                                                        placeholder="Activity name"
                                                                    />
                                                                    <div className="flex items-center gap-1 bg-slate-100/50 px-2 py-1 rounded-lg">
                                                                        <span className="text-[10px] font-bold text-slate-400">৳</span>
                                                                        <input
                                                                            type="number"
                                                                            value={act.cost || 0}
                                                                            onChange={(e) => updateActivity(idx, aIdx, 'cost', e.target.value)}
                                                                            className="w-12 bg-transparent text-right font-black text-xs focus:outline-none"
                                                                        />
                                                                    </div>
                                                                    <button onClick={() => removeActivity(idx, aIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/act:opacity-100 transition-opacity p-1">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => addActivity(idx)} className="text-xs font-bold text-brand-800 flex items-center gap-2 hover:bg-white px-4 py-2 rounded-xl transition-all mt-2 w-fit border border-transparent hover:border-slate-100">
                                                                <Plus size={14} /> Add Activity
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'budget' && (
                                <div className="space-y-8 animate-in-faded">
                                    {!aiResult ? (
                                        <div className="text-center py-20 text-slate-400 font-medium">No budget info yet. Generate a plan first.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h4>
                                                <div className="space-y-3">
                                                    {aiResult.breakdown.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                                                            <div className="flex-grow space-y-1">
                                                                <input value={item.category} onChange={(e) => updateBreakdown(idx, 'category', e.target.value)} className="bg-transparent font-black text-sm w-full focus:outline-none" />
                                                                <input value={item.description} onChange={(e) => updateBreakdown(idx, 'description', e.target.value)} className="bg-transparent text-[10px] text-slate-400 w-full focus:outline-none" />
                                                            </div>
                                                            <div className="flex items-center gap-1 font-black text-slate-900">
                                                                <span className="text-xs text-slate-400">৳</span>
                                                                <input type="number" value={item.amount} onChange={(e) => updateBreakdown(idx, 'amount', e.target.value)} className="bg-transparent w-20 text-right focus:outline-none" />
                                                            </div>
                                                            <button onClick={() => removeBreakdownItem(idx)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={saveTripBudget} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-200">Save Budget Changes</button>
                                            </div>

                                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Visual Distribution</h4>
                                                <div className="h-64 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                            </Pie>
                                                            <Tooltip borderStyle={{ borderRadius: '12px' }} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
