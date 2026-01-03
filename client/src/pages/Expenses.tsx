import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { expenseService, tripService, DEMO_USER_ID } from "../services/api";
import { Trash2, Plus, Filter, Wallet } from "lucide-react";

const Expenses: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tripIdParam = searchParams.get("tripId");

    const [trips, setTrips] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);

    const [selectedTripId, setSelectedTripId] = useState(tripIdParam || "");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        tripId: tripIdParam || "",
        category: "Food",
        amount: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = async (tripFilter: string) => {
        setError("");
        setLoading(true);
        try {
            const [expensesRes, tripsRes] = await Promise.all([
                expenseService.getAll(DEMO_USER_ID, tripFilter || undefined),
                tripService.getAll(DEMO_USER_ID),
            ]);
            setTrips(tripsRes.data || []);
            setExpenses(expensesRes.data || []);
        } catch {
            setTrips([]);
            setExpenses([]);
            setError("Failed to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tripIdParam) {
            setSelectedTripId(tripIdParam);
            setFormData((p) => ({ ...p, tripId: tripIdParam }));
            loadData(tripIdParam);
        } else {
            loadData(selectedTripId);
        }
    }, [tripIdParam, selectedTripId]);

    const total = useMemo(
        () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        [expenses]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await expenseService.create({
                ...formData,
                amount: Number(formData.amount || 0),
            });

            setShowForm(false);
            setFormData({
                tripId: selectedTripId || "",
                category: "Food",
                amount: "",
                description: "",
            });

            await loadData(selectedTripId);
        } catch {
            setError("Failed to save expense.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this expense?")) return;
        setError("");
        try {
            await expenseService.delete(id);
            await loadData(selectedTripId);
        } catch {
            setError("Delete failed.");
        }
    };

    if (loading) return <div className="text-slate-400 text-center py-20">Loading your expenses...</div>;

    return (
        <div className="tm-page py-8 space-y-8">
            <div className="tm-card">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Trip Expenses
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900">Track spending</h1>
                    </div>

                    <button
                        onClick={() => setShowForm((s) => !s)}
                        className="tm-btn-primary flex items-center gap-2"
                    >
                        {showForm ? "Cancel" : <><Plus size={18} /> Add Expense</>}
                    </button>
                </div>

                {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                            <Filter size={14} /> Filter by Trip
                        </label>
                        <select
                            className="tm-select mt-2"
                            value={selectedTripId}
                            onChange={(e) => setSelectedTripId(e.target.value)}
                        >
                            <option value="">All Trips</option>
                            {trips.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.title} — {t.destination}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="tm-panel bg-emerald-50 border-emerald-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={14} /> Total Spent
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-emerald-900">
                            ৳{total.toLocaleString()}
                        </p>
                    </div>
                </div>

                {showForm && (
                    <div className="mt-8 tm-panel bg-white shadow-md border-slate-200">
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-700">Select Trip</label>
                                <select
                                    className="tm-select mt-1"
                                    required
                                    value={formData.tripId}
                                    onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                                >
                                    <option value="">Choose a trip</option>
                                    {trips.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.title} — {t.destination}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Category</label>
                                <select
                                    className="tm-select mt-1"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Food</option>
                                    <option>Transport</option>
                                    <option>Hotel</option>
                                    <option>Shopping</option>
                                    <option>Tickets</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700">Amount (BDT)</label>
                                <input
                                    type="number"
                                    className="tm-input mt-1"
                                    required
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-700">Description</label>
                                <textarea
                                    rows={2}
                                    className="tm-input mt-1"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What was this for?"
                                />
                            </div>

                            <button type="submit" className="tm-btn-primary md:col-span-2 py-3 mt-2 shadow-lg">
                                Save Expense
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="tm-card">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Expense History</h2>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{expenses.length} Entries</span>
                </div>

                <div className="mt-6 space-y-4">
                    {expenses.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No expenses recorded for this selection.
                        </div>
                    ) : (
                        expenses.map((e) => (
                            <div key={e._id} className="tm-panel bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {e.category?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">
                                            {e.category}
                                            <span className="ml-3 text-emerald-600">৳{Number(e.amount || 0).toLocaleString()}</span>
                                        </div>
                                        {e.description && <p className="text-sm text-slate-500">{e.description}</p>}
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                            {e.date ? new Date(e.date).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(e._id)}
                                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                    title="Delete expense"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
