const PDFDocument = require("pdfkit");
const axios = require("axios");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");

function currencyByCountry(countryCode = "") {
  const map = {
    BD: "BDT", US: "USD", GB: "GBP", EU: "EUR", IN: "INR",
    AE: "AED", TR: "TRY", TH: "THB", MY: "MYR", SG: "SGD",
  };
  return map[countryCode.toUpperCase()] || "USD";
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchWeatherByCity(city) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("Missing Key");

    const wUrl = `https://api.openweathermap.org/data/2.5/weather`;
    const { data } = await axios.get(wUrl, {
      params: { q: city, appid: apiKey, units: "metric" },
      timeout: 15000,
    });

    return {
      ok: true,
      city: data?.name || city,
      country: data?.sys?.country || "",
      description: data?.weather?.[0]?.description || "",
      temp: safeNum(data?.main?.temp, null),
      feels: safeNum(data?.main?.feels_like, null),
      humidity: safeNum(data?.main?.humidity, null),
      wind: safeNum(data?.wind?.speed, null),
    };
  } catch (e) {
    return { ok: false, error: "Weather fetch failed." };
  }
}

async function fetchCurrency(base, target, amount) {
  const a = safeNum(amount, 1);
  try {
    const url = "https://api.exchangerate-api.com/v4/latest/" + encodeURIComponent(base);
    const { data } = await axios.get(url, { timeout: 15000 });
    const r = data?.rates?.[target];
    if (!r) throw new Error("Missing target rate");
    const rate = Number(r);
    const result = Number((a * rate).toFixed(6));
    return { ok: true, base, target, amount: a, rate, result };
  } catch (e) {
    return { ok: false, error: "Currency fetch failed." };
  }
}

function sectionHeader(doc, title, color = "#0ea5e9") {
  const y = doc.y;
  doc.save().roundedRect(50, y, 495, 24, 8).fill(color).restore();
  doc.fillColor("#ffffff").fontSize(12).text(title, 62, y + 6, { width: 470 });
  doc.moveDown(2);
  doc.fillColor("#000000");
}

function keyValue(doc, k, v) {
  doc.fontSize(11).fillColor("#111827").text(`${k}: `, { continued: true }).fillColor("#334155").text(`${v ?? "—"}`);
  doc.fillColor("#000000");
}

exports.exportTripPDF = async (req, res) => {
  const { tripId, city, base, target = "BDT", amount = 1, userId } = req.query;
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

    if (tripId) {
      trip = await Trip.findById(tripId);
      sectionHeader(doc, "Trip Details", "#7c3aed");
      if (!trip) {
        doc.fillColor("#b00020").fontSize(12).text("Trip not found.").fillColor("#000");
        doc.end();
        return;
      }
      keyValue(doc, "Title", trip.title);
      keyValue(doc, "Destination", trip.destination);
      keyValue(doc, "Dates", `${trip.startDate.toLocaleDateString()} - ${trip.endDate.toLocaleDateString()}`);
      doc.moveDown(1);
      usedCity = trip.destination || "";
    } else {
      usedCity = city ? String(city).trim() : "";
      sectionHeader(doc, "Dashboard Export", "#0ea5e9");
      doc.fontSize(11).fillColor("#334155").text(usedCity ? `Location: ${usedCity}` : "No location selected.");
      doc.fillColor("#000000").moveDown(1);
    }

    if (usedCity) {
      const weather = await fetchWeatherByCity(usedCity);
      sectionHeader(doc, "Weather Snapshot", "#0284c7");
      if (weather.ok) {
        usedCountry = weather.country || "";
        keyValue(doc, "City", `${weather.city}, ${weather.country}`);
        keyValue(doc, "Condition", weather.description);
        keyValue(doc, "Temp", `${Math.round(weather.temp)} C`);
      } else {
        doc.text("Weather not available.");
      }
      doc.moveDown(1);
    }

    const derivedBase = base ? String(base).toUpperCase() : currencyByCountry(usedCountry);
    const money = await fetchCurrency(derivedBase, target, amount);
    sectionHeader(doc, "Currency (to BDT)", "#16a34a");
    if (money.ok) {
      keyValue(doc, "Base", money.base);
      keyValue(doc, "Rate", `1 ${money.base} = ${money.rate.toFixed(4)} ${money.target}`);
    } else {
      doc.text("Currency not available.");
    }
    doc.moveDown(1);

    if (trip) {
      const expenses = await Expense.find({ tripId: trip._id });
      sectionHeader(doc, "Expenses", "#f97316");
      if (expenses.length) {
        let total = 0;
        expenses.forEach((e, i) => {
          total += e.amount;
          doc.fontSize(10).text(`${i + 1}. ${e.title} - ${e.amount} BDT`);
        });
        doc.moveDown(0.5).fontSize(12).text(`Total: ${total.toFixed(2)} BDT`);
      } else {
        doc.text("No expenses found.");
      }
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
