const path = require('path');

// Load environment variables from server/.env
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const app = require('../server/server.js');

module.exports = app;
