const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// API Routes from Fariha's branch (Member 2)
app.use('/api', require('./routes/api'));

// API Routes from Member-3 branch
const favoriteRoutes = require('./routes/favoriteRoutes');
app.use('/api/favorites', protect, favoriteRoutes);

const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budget', protect, budgetRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', protect, reviewRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', protect, chatRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', protect, uploadRoutes);

// API Routes from Bijoy's branch (Member 4)
// Note: These will be converted to CommonJS
const weatherRoutes = require('./routes/weatherRoutes');
app.use('/api/weather', protect, weatherRoutes);

const currencyRoutes = require('./routes/currencyRoutes');
app.use('/api/currency', protect, currencyRoutes);

const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', protect, tripRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', protect, expenseRoutes);

const flightRoutes = require('./routes/flightRoutes');
app.use('/api/flights', protect, flightRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', protect, dashboardRoutes);

const exportRoutes = require('./routes/exportRoutes');
app.use('/api/export', protect, exportRoutes);

app.get('/', (req, res) => {
    res.send('TravelMate API is running...');
});

const PORT = process.env.PORT || 5000;

// Only run the server if we are NOT on Vercel (Development mode)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Export the app for Vercel Serverless Functions
module.exports = app;
