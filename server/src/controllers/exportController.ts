import { Request, Response } from "express";
const PDFDocument = require("pdfkit");
import axios from "axios";
import Trip from "../models/Trip";
import Expense from "../models/Expense";

const currencyByCountry = (cc: string = "") => {
    const c = String(cc || "").toUpperCase();
    const map: any = {
        BD: "BDT", US: "USD", GB: "GBP", IN: "INR", JP: "JPY",
        AE: "AED", SA: "SAR", FR: "EUR", DE: "EUR", IT: "EUR",
        ES: "EUR", NL: "EUR", CA: "CAD", AU: "AUD", CN: "CNY",
    };
    return map[c] || "USD";
};

const safeNum = (v: any, fallback: number = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

async function fetchWeatherByCity(city: string) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === "your_openweather_api_key_here") {
        return { ok: false, error: "OPENWEATHER_API_KEY not configured." };
    }

    try {
        const url = "https://api.openweathermap.org/data/2.5/weather";
        const { data } = await axios.get(url, {
            params: { q: city, appid: apiKey, units: "metric" },
            timeout: 15000,
        });

        return {
            ok: true,
            city: data?.name || city,
            country: data?.sys?.country || "",
            description: data?.weather?.[0]?.description || "",
            temp: safeNum(data?.main?.temp, 0),
            feels: safeNum(data?.main?.feels_like, 0),
            humidity: safeNum(data?.main?.humidity, 0),
            wind: safeNum(data?.wind?.speed, 0),
        };
    } catch (e) {
        return { ok: false, error: "Weather fetch failed." };
    }
}

async function fetchCurrency(base: string, target: string, amount: number) {
    const a = safeNum(amount, 1);
    try {
        const url = "https://api.exchangerate.host/convert";
        const { data } = await axios.get(url, {
            params: { from: base, to: target, amount: a },
            timeout: 15000,
        });

        const rate = data?.info?.rate;
        const result = data?.result;
        if (rate == null || result == null) throw new Error("Missing rate/result");
        return { ok: true, base, target, amount: a, rate: Number(rate), result: Number(result) };
    } catch {
        try {
            const fb = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
            const { data } = await axios.get(fb, { timeout: 15000 });
            const r = data?.rates?.[target];
            if (!r) throw new Error("Missing target rate");
            const rate = Number(r);
            const result = Number((a * rate).toFixed(6));
            return { ok: true, base, target, amount: a, rate, result };
        } catch {
            return { ok: false, error: "Currency fetch failed." };
        }
    }
}

function sectionHeader(doc: any, title: string, color: string = "#0ea5e9") {
    const y = doc.y;
    doc.save().roundedRect(50, y, 495, 24, 8).fill(color).restore();
    doc.fillColor("#ffffff").fontSize(12).text(title, 62, y + 6, { width: 470 });
    doc.moveDown(2);
    doc.fillColor("#000000");
}

function keyValue(doc: any, k: string, v: any) {
    doc.fontSize(11).fillColor("#111827").text(`${k}: `, { continued: true }).fillColor("#334155").text(`${v ?? "—"}`);
    doc.fillColor("#000000");
}

export const exportTripPDF = async (req: Request, res: Response) => {
    const { tripId, city, base, target = "BDT", amount = 1, userId } = req.query as any;

    try {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="travelmate-report.pdf"');

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        doc.save().rect(0, 0, 612, 90).fill("#0b1220").restore();
        doc.fillColor("#ffffff").fontSize(22).text("TravelMate Report", 50, 28, { align: "left" });
        doc.fillColor("#cbd5e1").fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, 50, 55);
        doc.moveDown(4);
        doc.fillColor("#000000");

        let usedCity = "";
        let usedCountry = "";
        let trip = null;
        let expenses = [];

        if (tripId) {
            trip = userId ? await Trip.findOne({ _id: tripId, userId }) : await Trip.findById(tripId);
            sectionHeader(doc, "Trip Details", "#7c3aed");
            if (!trip) {
                doc.fillColor("#b00020").fontSize(12).text("Trip not found.").fillColor("#000");
                doc.end();
                return;
            }
            keyValue(doc, "Title", trip.title);
            keyValue(doc, "Destination", trip.destination);
            keyValue(doc, "Dates", `${trip.startDate} - ${trip.endDate}`);
            keyValue(doc, "Type", trip.type || "Leisure");
            doc.moveDown(1);
            usedCity = trip.destination || "";
        } else {
            usedCity = city ? String(city).trim() : "";
            sectionHeader(doc, "Dashboard Export", "#0ea5e9");
            doc.fontSize(11).fillColor("#334155");
            doc.text(usedCity ? `Location selected: ${usedCity}` : "No location selected (Weather & Currency will be blank).");
            doc.fillColor("#000000");
            doc.moveDown(1);
        }

        let weather: any = null;
        if (usedCity) {
            weather = await fetchWeatherByCity(usedCity);
            if (weather.ok) usedCountry = weather.country || "";
        }

        sectionHeader(doc, "Weather Snapshot", "#0284c7");
        if (!usedCity) {
            doc.fillColor("#64748b").fontSize(11).text("--").fillColor("#000000").moveDown(1);
        } else if (!weather?.ok) {
            doc.fillColor("#b00020").fontSize(11).text("Weather not available.").fillColor("#000000").moveDown(1);
        } else {
            keyValue(doc, "City", `${weather.city}${weather.country ? `, ${weather.country}` : ""}`);
            keyValue(doc, "Condition", weather.description || "--");
            keyValue(doc, "Temperature", weather.temp != null ? `${Math.round(weather.temp)} C` : "--");
            keyValue(doc, "Feels like", weather.feels != null ? `${Math.round(weather.feels)} C` : "--");
            keyValue(doc, "Humidity", weather.humidity != null ? `${weather.humidity}%` : "--");
            keyValue(doc, "Wind", weather.wind != null ? `${weather.wind} m/s` : "--");
            doc.moveDown(1);
        }

        sectionHeader(doc, "Currency (to BDT)", "#16a34a");
        if (!usedCity) {
            doc.fillColor("#64748b").fontSize(11).text("--").fillColor("#000000").moveDown(1);
        } else {
            const derivedBase = base ? String(base).toUpperCase() : currencyByCountry(usedCountry);
            const money = await fetchCurrency(derivedBase as string, target as string, Number(amount));
            if (!money.ok) {
                doc.fillColor("#b00020").fontSize(11).text("Currency not available.").fillColor("#000000").moveDown(1);
            } else {
                keyValue(doc, "Base", money.base);
                keyValue(doc, "Target", money.target);
                keyValue(doc, "Rate", `1 ${money.base} = ${Number(money.rate).toFixed(4)} ${money.target}`);
                keyValue(doc, "Converted", `${money.amount} ${money.base} = ${Number(money.result).toFixed(2)} ${money.target}`);
                doc.moveDown(1);
            }
        }

        if (trip) {
            expenses = await Expense.find({ tripId: (tripId as string) });
            sectionHeader(doc, "Expenses Summary", "#f97316");
            if (!expenses.length) {
                doc.fillColor("#64748b").fontSize(11).text("No expenses found.").fillColor("#000000").moveDown(1);
            } else {
                let total = 0;
                expenses.forEach((e, idx) => {
                    total += Number(e.amount || 0);
                    doc.fontSize(10).fillColor("#0f172a").text(`${idx + 1}. ${e.category || "Other"} - BDT ${e.amount || 0}`);
                    if (e.description) doc.fontSize(9).fillColor("#475569").text(`   • ${e.description}`);
                });
                doc.moveDown(0.5).fontSize(12).fillColor("#0f172a").text(`Total Spent: BDT ${total.toFixed(2)}`).moveDown(1);
            }
        }

        doc.moveDown(1).fontSize(9).fillColor("#64748b").text("TravelMate Report", { align: "center" }).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
};
