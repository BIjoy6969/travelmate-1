import { useEffect, useState } from "react";
import { tripService, exportService } from "../services/api";
import { useNavigate } from "react-router-dom";
import PlaceAutocomplete from "../components/PlaceAutocomplete";

export default function Trips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    type: "Leisure",
    budget: "",
    notes: "",
  });

  const loadTrips = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await tripService.getAll();
      setTrips(res.data || []);
    } catch {
      setTrips([]);
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await tripService.create({ ...formData });
      setShowForm(false);
      setFormData({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        type: "Leisure",
        budget: "",
        notes: "",
      });
      await loadTrips();
    } catch {
      setError("Failed to create trip.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    setError("");
    try {
      await tripService.delete(id);
      await loadTrips();
    } catch {
      setError("Failed to delete trip.");
    }
  };

  const handleExport = (tripId) => exportService.exportPDF({ tripId });

  if (loading) return <div className="text-slate-400 text-center py-8">Loading...</div>;

  return (
    <div className="tm-page space-y-6">
      <div className="tm-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Trips
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Plan your trip</h1>
          </div>

          <div className="flex gap-2">
            <button onClick={loadTrips} className="tm-btn-secondary px-4 py-2 text-xs">
              Refresh
            </button>
            <button onClick={() => setShowForm((s) => !s)} className="tm-btn-primary px-4 py-2">
              {showForm ? "Close" : "+ New"}
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {showForm && (
          <div className="mt-6 tm-panel">
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <input
                className="tm-input md:col-span-2"
                required
                placeholder="Trip Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Destination</label>
                <PlaceAutocomplete onPlaceSelect={(place) => setFormData({ ...formData, destination: place.name })} />
              </div>
              <input
                type="date"
                className="tm-input"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <input
                type="date"
                className="tm-input"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              <select
                className="tm-select md:col-span-2"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Leisure">Leisure</option>
                <option value="Business">Business</option>
                <option value="Adventure">Adventure</option>
                <option value="Family">Family</option>
              </select>
              <input
                type="number"
                className="tm-input"
                placeholder="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
              <textarea
                className="tm-input md:col-span-2"
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <button type="submit" className="tm-btn-primary md:col-span-2">
                Create Trip
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="tm-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Trips</h2>
          <span className="tm-badge">{trips.length} trips</span>
        </div>

        {trips.length === 0 ? (
          <div className="mt-4 tm-panel text-sm text-slate-400">No trips yet.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {trips.map((trip) => (
              <div key={trip._id} className="tm-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-100">{trip.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{trip.destination}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""} → {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-block tm-badge">{trip.tripType || trip.type}</span>
                      {trip.budget > 0 && <span className="inline-block tm-badge bg-green-500/20 text-green-300">${trip.budget}</span>}
                    </div>
                    {trip.notes && <p className="mt-2 text-sm text-slate-400 italic">"{trip.notes}"</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/expenses?tripId=${trip._id}`)}
                      className="tm-btn-secondary px-4 py-2"
                    >
                      Expenses
                    </button>

                    <button onClick={() => handleExport(trip._id)} className="tm-btn-primary px-4 py-2">
                      Export PDF
                    </button>

                    <button onClick={() => handleDelete(trip._id)} className="tm-btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
