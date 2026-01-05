import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, DollarSign, Calendar, TrendingUp, Sparkles, Plus, Wallet, PieChart as PieIcon, History, X, Check, ArrowRight, MapPin, Plane, Coffee, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { budgetService } from '../services/api';

const BudgetTracker = () => {
    const [budgetData, setBudgetData] = useState(null);
    const [newExpense, setNewExpense] = useState({ category: 'Food', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

    // Trip Setup & AI State
    const [setup, setSetup] = useState({
        destination: '',
        travelStyle: 'Standard',
        startDate: '',
        endDate: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'itinerary', 'expenses'
    const [error, setError] = useState(null);

    const COLORS = ['#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#334155', '#475569'];

    useEffect(() => {
        fetchLatestBudget();
    }, []);

    const fetchLatestBudget = async () => {
        try {
            const res = await budgetService.getAll();
            if (res.data && res.data.length > 0) {
                const data = res.data[0];
                setBudgetData(data);
                if (data.destination) {
                    setSetup({
                        destination: data.destination,
                        travelStyle: data.travelStyle || 'Standard',
                        startDate: data.tripStartDate ? data.tripStartDate.split('T')[0] : '',
                        endDate: data.tripEndDate ? data.tripEndDate.split('T')[0] : ''
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching budget:", err);
            setError("Failed to load budget data.");
        }
    };

    const handleGenerateAI = async (e) => {
        e.preventDefault();
        if (!setup.destination || !setup.startDate || !setup.endDate) return;

        setIsGenerating(true);
        setError(null);
        try {
            const res = await budgetService.generate({
                destination: setup.destination,
                travelStyle: setup.travelStyle,
                tripStartDate: setup.startDate,
                tripEndDate: setup.endDate
            });

            const aiResult = res.data;

            // Save to DB
            const saveRes = await budgetService.create({
                destination: setup.destination,
                travelStyle: setup.travelStyle,
                totalBudget: aiResult.totalEstimatedCost,
                tripStartDate: setup.startDate,
                tripEndDate: setup.endDate,
                estimatedBreakdown: aiResult.breakdown,
                itinerary: aiResult.itinerary
            });

            setBudgetData(saveRes.data);
            setActiveTab('summary');
        } catch (err) {
            console.error("AI Generation failed:", err);
            setError(err.response?.data?.message || "Failed to generate AI budget.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!budgetData) return;

        try {
            const res = await budgetService.addExpense(newExpense);
            setBudgetData(res.data);
            setNewExpense({
                category: 'Food',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Add expense failed:", err);
            setError("Failed to add expense.");
        }
    };

    const deleteExpense = async (expenseId) => {
        try {
            const res = await budgetService.deleteExpense(expenseId);
            setBudgetData(res.data);
        } catch (err) {
            console.error("Delete failed:", err);
            setError("Failed to delete expense.");
        }
    };

    const totalSpent = budgetData?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const remaining = (budgetData?.totalBudget || 0) - totalSpent;
    const progress = budgetData?.totalBudget ? (totalSpent / budgetData.totalBudget) * 100 : 0;

    const chartData = budgetData?.estimatedBreakdown?.map(item => ({
        name: item.category,
        value: item.amount
    })) || [];

    return (
        <div className="tm-page py-12 px-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-minimal-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-brand-800 font-bold uppercase tracking-widest text-[10px]">
                        <TrendingUp size={14} /> Finance Control
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-minimal-text tracking-tighter">
                        BUDGET <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-800 to-brand-400 text-slate-800">TRACKER.</span>
                    </h1>
                    <p className="text-minimal-muted font-medium max-w-md">Plan your trip expenses with AI and keep track of your actual spending.</p>
                </div>

                {budgetData && (
                    <div className="flex gap-2">
                        {['summary', 'itinerary', 'expenses'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                        ? 'bg-brand-900 text-white shadow-lg'
                                        : 'bg-white text-minimal-muted border border-minimal-border hover:border-brand-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in slide-in-from-top-4">
                    <X size={18} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Setup Form */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card-minimal p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-minimal-border">
                            <Sparkles className="text-brand-800" size={20} />
                            <h3 className="font-bold text-minimal-text">AI Trip Setup</h3>
                        </div>

                        <form onSubmit={handleGenerateAI} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-minimal-muted" size={16} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Paris, France"
                                        className="input-minimal w-full pl-10"
                                        value={setup.destination}
                                        onChange={e => setSetup({ ...setup, destination: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Travel Style</label>
                                <select
                                    className="input-minimal w-full"
                                    value={setup.travelStyle}
                                    onChange={e => setSetup({ ...setup, travelStyle: e.target.value })}
                                >
                                    <option>Budget</option>
                                    <option>Standard</option>
                                    <option>Luxury</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Start Date</label>
                                    <input
                                        type="date"
                                        className="input-minimal w-full text-xs"
                                        value={setup.startDate}
                                        onChange={e => setSetup({ ...setup, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">End Date</label>
                                    <input
                                        type="date"
                                        className="input-minimal w-full text-xs"
                                        value={setup.endDate}
                                        onChange={e => setSetup({ ...setup, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="btn-minimal-primary w-full py-4 flex items-center justify-center gap-2 mt-4 shadow-xl"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Analyzing Costs...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate AI Plan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {budgetData && (
                        <div className="card-minimal p-8 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-minimal-muted flex items-center gap-2 pb-4 border-b border-minimal-border">
                                <Wallet size={14} /> Estimated Breakdown
                            </h3>
                            <div className="space-y-4">
                                {budgetData.estimatedBreakdown?.map((item, idx) => (
                                    <div key={idx} className="space-y-1 group">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-minimal-text">{item.category}</span>
                                            <span className="font-medium text-brand-800">${item.amount}</span>
                                        </div>
                                        <p className="text-[11px] text-minimal-muted leading-tight">{item.description}</p>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-minimal-border flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-minimal-muted">Total Estimate</span>
                                    <span className="text-xl font-bold text-minimal-text">${budgetData.totalBudget}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Tabbed Content */}
                <div className="lg:col-span-8 space-y-8">
                    {!budgetData && !isGenerating && (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed border-minimal-border rounded-3xl">
                            <div className="w-16 h-16 bg-minimal-surface rounded-full flex items-center justify-center">
                                <Sparkles size={32} className="text-minimal-muted" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <h3 className="text-xl font-bold">Ready to Start?</h3>
                                <p className="text-sm text-minimal-muted">Fill out your trip details to get an AI-powered budget and itinerary.</p>
                            </div>
                        </div>
                    )}

                    {budgetData && activeTab === 'summary' && (
                        <div className="space-y-8 animate-in-faded">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="card-minimal p-6 bg-brand-900 text-white border-none shadow-xl">
                                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Total Budget</p>
                                    <h3 className="text-2xl font-bold">${budgetData.totalBudget.toLocaleString()}</h3>
                                </div>
                                <div className="card-minimal p-6">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Actually Spent</p>
                                    <h3 className="text-2xl font-bold text-minimal-text">${totalSpent.toLocaleString()}</h3>
                                </div>
                                <div className="card-minimal p-6">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Remaining</p>
                                    <h3 className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-teal-600'}`}>${remaining.toLocaleString()}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                                <div className="card-minimal p-8 flex flex-col">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted mb-6">Spending Distribution</div>
                                    <div className="flex-grow">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value">
                                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="card-minimal p-8 flex flex-col">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted mb-6">Budget Health</div>
                                    <div className="flex flex-col justify-center flex-grow space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span>Progress</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-minimal-surface rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-800 transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-minimal-surface rounded-xl border border-minimal-border">
                                            <p className="text-xs text-minimal-muted italic">"You're currently spending about ${totalSpent} in total. Based on your {setup.travelStyle} style, you're {progress > 80 ? 'approaching your limit' : 'on track'}."</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {budgetData && activeTab === 'itinerary' && (
                        <div className="space-y-6 animate-in-faded">
                            <div className="grid gap-6">
                                {budgetData.itinerary?.length > 0 ? (
                                    budgetData.itinerary.map((day, idx) => (
                                        <div key={idx} className="card-minimal p-6 flex gap-6 group hover:border-brand-200 transition-all">
                                            <div className="w-12 h-12 bg-brand-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-brand-800">
                                                <span className="text-[10px] font-bold uppercase">Day</span>
                                                <span className="text-xl font-black">{day.day}</span>
                                            </div>
                                            <div className="flex-grow space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        {day.activities.map((activity, aIdx) => (
                                                            <div key={aIdx} className="flex items-center gap-3 text-sm text-minimal-text">
                                                                <ChevronRight size={14} className="text-brand-300" />
                                                                {activity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] uppercase font-bold tracking-widest text-minimal-muted">Est. Cost</div>
                                                        <div className="text-lg font-bold text-brand-800">${day.estimatedCost}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-12 text-minimal-muted italic">No itinerary data available for this trip.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {budgetData && activeTab === 'expenses' && (
                        <div className="space-y-8 animate-in-faded">
                            {/* Expense Form */}
                            <div className="card-minimal p-8 bg-slate-50 border-slate-200">
                                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2 md:col-span-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted">Category</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="input-minimal w-full text-sm"
                                        >
                                            {['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted">Description</label>
                                        <input type="text" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="input-minimal w-full text-sm" placeholder="e.g. Sushi dinner" required />
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-minimal-muted">Amount ($)</label>
                                        <input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="input-minimal w-full text-sm" placeholder="0" required />
                                    </div>
                                    <button type="submit" className="btn-minimal-primary h-[45px] flex items-center justify-center gap-2">
                                        <Plus size={16} /> Add
                                    </button>
                                </form>
                            </div>

                            {/* Expense History */}
                            <div className="card-minimal overflow-hidden">
                                <div className="p-4 border-b border-minimal-border bg-minimal-surface flex justify-between items-center">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-minimal-muted flex items-center gap-2">
                                        <History size={14} /> Transaction Journal
                                    </h3>
                                    <span className="text-[10px] font-bold text-minimal-muted">{budgetData.expenses.length} Entries</span>
                                </div>
                                <div className="divide-y divide-minimal-border">
                                    {budgetData.expenses.slice().reverse().map(exp => (
                                        <div key={exp._id} className="p-5 flex items-center justify-between group hover:bg-minimal-surface transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-minimal-border flex items-center justify-center text-brand-800">
                                                    {exp.category === 'Food' && <Coffee size={18} />}
                                                    {exp.category === 'Transport' && <Plane size={18} />}
                                                    {exp.category === 'Lodging' && <MapPin size={18} />}
                                                    {(exp.category === 'Shopping' || exp.category === 'Activities' || exp.category === 'Other') && <CreditCard size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-minimal-text">{exp.description}</div>
                                                    <div className="text-[10px] text-minimal-muted flex items-center gap-2">
                                                        <span className="uppercase font-bold tracking-tighter">{exp.category}</span>
                                                        <span>•</span>
                                                        <span>{new Date(exp.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-sm font-black text-minimal-text">${exp.amount}</div>
                                                <button onClick={() => deleteExpense(exp._id)} className="p-2 text-minimal-muted hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {budgetData.expenses.length === 0 && (
                                        <div className="p-12 text-center text-sm text-minimal-muted italic">No expenses recorded yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetTracker;
