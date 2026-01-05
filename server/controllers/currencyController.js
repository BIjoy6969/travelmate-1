const axios = require("axios");

/**
 * Provider: open.er-api.com (no API key)
 * Example:
 * https://open.er-api.com/v6/latest/USD
 * -> rates: { BDT: ..., EUR: ... }
 */
exports.convertCurrency = async (req, res) => {
  const base = String(req.query.base || "USD").toUpperCase();
  const target = String(req.query.target || "BDT").toUpperCase();
  const amount = Number(req.query.amount ?? 1);

  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Same currency shortcut (no API call)
  if (base === target) {
    return res.json({
      base,
      target,
      amount,
      rate: 1,
      result: amount,
      provider: "local",
    });
  }

  try {
    const url = `https://open.er-api.com/v6/latest/${base}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    // er-api uses "result": "success" on success
    if (data?.result !== "success") {
      return res.status(502).json({
        error: "Currency provider error",
        providerMessage: data?.error_type || "Unknown",
      });
    }

    const rate = data?.rates?.[target];

    if (typeof rate !== "number") {
      return res.status(400).json({
        error: `Unsupported currency code: ${target}`,
        base,
        target,
      });
    }

    const result = amount * rate;

    res.json({
      base,
      target,
      amount,
      rate,     // 1 BASE = rate TARGET
      result,   // amount BASE = result TARGET
      provider: "open.er-api",
      time_last_update_utc: data?.time_last_update_utc,
    });
  } catch (err) {
    console.error("Currency convert error:", err?.message);
    res.status(500).json({ error: "Failed to fetch currency rate" });
  }
};
