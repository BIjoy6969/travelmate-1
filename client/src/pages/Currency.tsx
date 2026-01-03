import React, { useMemo, useState } from "react";
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

const findLabel = (code: string) => {
    const x = currencyOptions.find((c) => c.code === code);
    return x ? `${x.flag} ${x.code} — ${x.name}` : code;
};

const Currency: React.FC = () => {
    const [base, setBase] = useState("USD");
    const [target, setTarget] = useState("BDT");
    const [amount, setAmount] = useState(500);

    const [rateOne, setRateOne] = useState<number | null>(null);
    const [converted, setConverted] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const pairTitle = useMemo(() => `${base} to ${target}`, [base, target]);
    const pill = useMemo(() => `${base} → ${target}`, [base, target]);

    const fmt = (n: number | null) =>
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
            const res = await currencyService.convert(base, target, amount);
            const resultAmount = typeof res.data?.result === "number" ? res.data.result : null;

            const resOne = await currencyService.convert(base, target, 1);
            const oneAmount = typeof resOne.data?.result === "number" ? resOne.data.result : null;

            setConverted(resultAmount);
            setRateOne(oneAmount);
        } catch (e: any) {
            setError(
                e?.response?.data?.error ||
                "Conversion failed. Check backend is running."
            );
            setRateOne(null);
            setConverted(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tm-page py-8">
            <div className="tm-card max-w-4xl mx-auto">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            Currency Converter
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900">
                            {pairTitle}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter amount and pick currencies to convert.
                        </p>
                    </div>
                    <span className="tm-badge self-start">{pill}</span>
                </div>

                <div className="mt-8 tm-panel bg-white p-6 shadow-sm">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700">From</label>
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
                            <p className="text-xs text-slate-400 font-medium">{findLabel(base)}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700">To</label>
                            <input
                                className="tm-input bg-slate-50"
                                value={converted !== null ? converted.toFixed(2) : ""}
                                readOnly
                                placeholder="Result"
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
                            <p className="text-xs text-slate-400 font-medium">{findLabel(target)}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100">
                        <button onClick={swap} className="tm-btn-secondary">
                            ⇄ Swap Currencies
                        </button>

                        <button
                            onClick={convertNow}
                            disabled={loading}
                            className="tm-btn-primary px-12 py-3 text-base"
                        >
                            {loading ? "Converting..." : "Convert"}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {rateOne && (
                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm font-bold text-slate-900">
                                1 {base} = {fmt(rateOne)} {target}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Live exchange rate applied.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Currency;
