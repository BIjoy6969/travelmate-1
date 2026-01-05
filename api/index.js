const path = require('path');

// Load environment variables BEFORE importing the server
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

// Import the Express app
const app = require('../server/server.js');

// Export for Vercel serverless
module.exports = app;
