const path = require('path');

// Load environment variables from Vercel's environment
// On Vercel, env vars are set in the dashboard, not from .env file
// This is a fallback for local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });
}

// Import the Express app
const app = require('../server/server.js');

// Export for Vercel serverless
module.exports = app;
