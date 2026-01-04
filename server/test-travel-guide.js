const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Create log file
fs.writeFileSync('travel_guide_debug.log', '--- Travel Guide API Test ---\n');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('travel_guide_debug.log', msg + '\n');
};

const options = {
    method: 'POST',
    url: 'https://travel-guide-api-city-guide-top-places.p.rapidapi.com/check',
    params: { noqueue: '1' },
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'travel-guide-api-city-guide-top-places.p.rapidapi.com',
        'Content-Type': 'application/json'
    },
    data: {
        region: 'London',
        language: 'en',
        interests: [
            'historical',
            'cultural',
            'food'
        ]
    }
};

(async () => {
    try {
        log('Sending Request to Travel Guide API...');
        const response = await axios.request(options);
        log(`Response Status: ${response.status}`);
        const dataStr = JSON.stringify(response.data, null, 2);
        log('Response Data Snippet (First 500 chars):');
        log(dataStr.substring(0, 500));

        // Log full structure for analysis
        fs.writeFileSync('travel_guide_response.json', dataStr);
        log('Full response saved to travel_guide_response.json');

    } catch (error) {
        log('--- API Call Failed ---');
        log(`Error: ${error.message}`);
        if (error.response) {
            log(`Status: ${error.response.status}`);
            log(JSON.stringify(error.response.data, null, 2));
        }
    }
})();
