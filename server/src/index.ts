import 'dotenv/config';
// Touch to trigger restart 2
import app from './app';
import cors from 'cors'; // Added import for cors

const PORT = process.env.PORT || 8000;

// Added CORS middleware before app.listen
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
