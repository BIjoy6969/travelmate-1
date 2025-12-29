import express from 'express';
import cors from 'cors';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import destinationRoutes from './routes/destinationRoutes';
import tripRoutes from './routes/tripRoutes';
import budgetRoutes from './routes/budgetRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import chatRoutes from './routes/chatRoutes';
import weatherRoutes from './routes/weatherRoutes';
import flightRoutes from './routes/flightRoutes';
import bookingRoutes from './routes/bookingRoutes';





const app = express();

// Connect Database
// Note: For tests we might want to connect differently, but this is simple for now.
// Actually, for tests we should prevent auto-connection if possible, or handle it in test setup.
// But keeping it simple:
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Middleware
app.use(helmet());
app.use(cookieParser()); // Forgot this earlier!
app.use(cors({
    origin: (origin, callback) => {
        // Allow no origin (mobile apps, curl) or any localhost/127.0.0.1
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('TravelMate API is running');
});

export default app;
