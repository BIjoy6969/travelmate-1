import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { expenseService, tripService, DEMO_USER_ID } from "../services/api";

export default function Expenses() {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get("tripId");

  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);

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

  const loadData = async (tripFilter) => {
    setError("");
    setLoading(true);
    try {
      const [expensesRes, tripsRes] = await Promise.all([
        expenseService.getAll(DEMO_USER_ID, tripFilter || null),
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
      loadData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripIdParam]);

  useEffect(() => {
    if (!tripIdParam) loadData(selectedTripId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTripId]);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await expenseService.create({
        ...formData,
        userId: DEMO_USER_ID,
        amount: Number(formData.amount || 0),
      });

      setShowForm(false);
      setFormData({
        tripId: selectedTripId || tripIdParam || "",
        category: "Food",
        amount: "",
        description: "",
      });

      await loadData(selectedTripId || tripIdParam || "");
    } catch {
      setError("Failed to save expense.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setError("");
    try {
      await expenseService.delete(id);
      await loadData(selectedTripId || tripIdParam || "");
    } catch {
      setError("Delete failed.");
    }
  };

  if (loading) return <div className="text-slate-400 text-center py-8">Loading...</div>;

  return (
    <div className="tm-page space-y-6">
      <div className="tm-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Expenses
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Track spending</h1>
          </div>

          <button onClick={() => setShowForm((s) => !s)} className="tm-btn-primary px-4 py-2">
            {showForm ? "Close" : "+ Add"}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">Trip filter</label>
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

          <div className="tm-panel">
            <p className="text-xs text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              ৳{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="mt-6 tm-panel">
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-300">Trip</label>
                <select
                  className="tm-select mt-2"
                  required
                  value={formData.tripId}
                  onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                >
                  <option value="">Select trip</option>
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} — {t.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300">Category</label>
                <select
                  className="tm-select mt-2"
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
                <label className="text-xs text-slate-300">Amount (BDT)</label>
                <input
                  type="number"
                  className="tm-input mt-2"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-300">Description</label>
                <textarea
                  rows={3}
                  className="tm-input mt-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional note"
                />
              </div>

              <button type="submit" className="tm-btn-primary md:col-span-2">
                Save Expense
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="tm-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Expense List</h2>
          <span className="tm-badge">{expenses.length} items</span>
        </div>

        {expenses.length === 0 ? (
          <div className="mt-4 tm-panel text-sm text-slate-400">No expenses found.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {expenses.map((e) => (
              <div key={e._id} className="tm-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {e.category}{" "}
                      <span className="ml-2 text-emerald-300">
                        ৳{Number(e.amount || 0).toLocaleString()}
                      </span>
                    </p>
                    {e.description && <p className="mt-1 text-sm text-slate-300">{e.description}</p>}
                    <p className="mt-2 text-xs text-slate-500">
                      {e.date ? new Date(e.date).toLocaleDateString() : ""}
                    </p>
                  </div>

                  <button onClick={() => handleDelete(e._id)} className="tm-btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
