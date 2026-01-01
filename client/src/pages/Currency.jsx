import { useMemo, useState } from "react";
import { currencyService } from "../services/api";

const currencyOptions = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
];

const findLabel = (code) => {
  const x = currencyOptions.find((c) => c.code === code);
  return x ? `${x.flag} ${x.code} — ${x.name}` : code;
};

export default function Currency() {
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("BDT");
  const [amount, setAmount] = useState(500);

  const [rateOne, setRateOne] = useState(null); // 1 BASE = X TARGET
  const [converted, setConverted] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pairTitle = useMemo(() => `${base} to ${target}`, [base, target]);
  const pill = useMemo(() => `${base} → ${target}`, [base, target]);

  const fmt = (n) =>
    typeof n === "number" && Number.isFinite(n)
      ? n.toLocaleString(undefined, { maximumFractionDigits: 6 })
      : "—";

  const swap = () => {
    setError("");
    setRateOne(null);
    setConverted(null);
    setBase(target);
    setTarget(base);
  };

  const convertNow = async () => {
    setError("");
    setLoading(true);

    try {
      // 1) convert amount
      const res = await currencyService.convert(base, target, amount);
      const resultAmount =
        typeof res.data?.result === "number" ? res.data.result : null;

      // 2) also fetch rate for 1 unit (for XE style "1 USD = X BDT")
      const resOne = await currencyService.convert(base, target, 1);
      const oneAmount =
        typeof resOne.data?.result === "number" ? resOne.data.result : null;

      setConverted(resultAmount);
      setRateOne(oneAmount);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          "Conversion failed. Check backend is running and /api/currency works."
      );
      setRateOne(null);
      setConverted(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="tm-card" style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Currency Converter
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-100">
              {pairTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Pick currencies, enter amount, and convert like XE.
            </p>
          </div>

          <span className="tm-badge self-start">{pill}</span>
        </div>

        {/* Converter Card (XE style) */}
        <div className="mt-6 tm-panel" style={{ padding: 16 }}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* FROM */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">From</label>
              <input
                className="tm-input"
                value={amount}
                type="number"
                min="0"
                onChange={(e) => {
                  setConverted(null);
                  setRateOne(null);
                  setAmount(Number(e.target.value || 0));
                }}
                placeholder="Enter amount"
              />
              <select
                className="tm-select"
                value={base}
                onChange={(e) => {
                  setConverted(null);
                  setRateOne(null);
                  setBase(e.target.value);
                }}
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">{findLabel(base)}</p>
            </div>

            {/* TO */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">To</label>
              <input
                className="tm-input"
                value={converted ?? ""}
                readOnly
                placeholder="Converted amount"
              />
              <select
                className="tm-select"
                value={target}
                onChange={(e) => {
                  setConverted(null);
                  setRateOne(null);
                  setTarget(e.target.value);
                }}
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">{findLabel(target)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={swap} className="tm-btn-secondary px-4 py-2">
              ⇄ Swap
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {[100, 500, 1000].map((x) => (
                <button
                  key={x}
                  className="tm-btn-secondary px-3 py-2"
                  onClick={() => {
                    setRateOne(null);
                    setConverted(null);
                    setAmount(x);
                  }}
                >
                  {x}
                </button>
              ))}
              <button
                onClick={convertNow}
                disabled={loading}
                className="tm-btn-primary px-6 py-2"
                style={{ minWidth: 140 }}
              >
                {loading ? "Converting..." : "Convert"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Result line like XE */}
          <div className="mt-4">
            {rateOne ? (
              <p className="text-sm text-slate-200">
                <span className="font-semibold">
                  1 {base} = {fmt(rateOne)} {target}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  • Live rate
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-400">Press Convert to show live rate.</p>
            )}
          </div>
        </div>

        {/* Big result block */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="tm-panel">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
              Rate
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {rateOne ? `1 ${base} = ${fmt(rateOne)} ${target}` : "—"}
            </p>
          </div>

          <div className="tm-panel">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
              Converted
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {converted !== null ? `${fmt(converted)} ${target}` : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {amount} {base} → {target}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
