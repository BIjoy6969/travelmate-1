import axios from "axios";

export const getWeather = async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: "city is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === "your_openweather_api_key_here") {
      return res.status(500).json({
        error:
          "Weather API key not configured. Please set OPENWEATHER_API_KEY in .env file",
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    const { data } = await axios.get(url);

    res.json({
      city: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      feelsLike: data.main?.feels_like,
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      description: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({
        error: "Invalid OpenWeather API key. Please check OPENWEATHER_API_KEY.",
      });
    }
    if (err.response?.status === 404) {
      return res.status(404).json({
        error: `City "${city}" not found. Please check the city name.`,
      });
    }

    res.status(500).json({
      error:
        err.response?.data?.message ||
        "Failed to fetch weather. Please try again.",
    });
  }
};
