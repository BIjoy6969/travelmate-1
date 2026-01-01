import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // MUST run before any DB connection attempts
import { connectDB } from "./config/database.js";

// Import routes
import weatherRoutes from "./routes/weatherRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.json({ message: "TravelMate API running" });
});

// API routes
app.use("/api/weather", weatherRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
