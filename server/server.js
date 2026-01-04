const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Attempt to use either config/db.js or config/database.js if one exists
let connectDB;
try {
    connectDB = require('./config/db');
} catch (e) {
    try {
        connectDB = require('./config/database').connectDB;
    } catch (e2) {
        console.error("Could not find db connection file");
    }
}

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
if (connectDB) connectDB();

// API Routes from Fariha's branch
app.use('/api', require('./routes/api'));

// API Routes from Member-3 branch
const favoriteRoutes = require('./routes/favoriteRoutes');
app.use('/api/favorites', favoriteRoutes);

const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budget', budgetRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('TravelMate API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
