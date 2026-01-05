import { useMemo, useState } from "react";
import { currencyService } from "../services/api";

const POPULAR = [
  { code: "USD", name: "US Dollar" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "INR", name: "Indian Rupee" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" },
];

export default function CurrencyConverter({
  defaultBase = "USD",
  defaultTarget = "BDT",
  compact = false,
  onChange,
}) {
  const [base, setBase] = useState(defaultBase);
  const [target, setTarget] = useState(defaultTarget);
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountNumber = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const convert = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await currencyService.convert(base, target, amountNumber || 1);
      setResult(res.data?.result);
      setRate(res.data?.rate);
      onChange?.({
        base,
        target,
        amount: amountNumber || 1,
        result: res.data?.result,
        rate: res.data?.rate,
      });
    } catch (e) {
      setResult(null);
      setRate(null);
      setError(e?.response?.data?.error || "Currency conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setBase(target);
    setTarget(base);
    setResult(null);
    setRate(null);
  };

  return (
    <div className={compact ? "" : "w-full"}>
      <div className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">💱 Currency Converter</p>
            <p className="text-xs text-slate-500">
              Live Exchange Rates
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600">From</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {POPULAR.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600">To</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {POPULAR.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={convert}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
          >
            {loading ? "Converting…" : "Convert"}
          </button>
          <button
            onClick={swap}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            ⇄ Swap
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {(result != null || rate != null) && !error && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Result</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {Number(result).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              {target}
            </p>
            {rate != null && (
              <p className="mt-1 text-sm text-slate-600">
                1 {base} ≈ {Number(rate).toLocaleString(undefined, { maximumFractionDigits: 6 })} {target}
              </p>
            )}
          </div>
        )}

        {!result && !rate && !error && (
          <p className="mt-4 text-sm text-slate-500">
            Tip: convert your budget before booking flights & hotels.
          </p>
        )}
      </div>
    </div>
  );
}
