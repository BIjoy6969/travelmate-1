const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Create log file
fs.writeFileSync('hotel_debug.log', '--- Hotel API Test Started ---\n');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('hotel_debug.log', msg + '\n');
};

async function testHotelSearch() {
    log('Testing Hotel Search with settings:');
    log(`Host: ${process.env.RAPIDAPI_HOST_TRIPADVISOR}`);
    log(`Key: ${process.env.RAPIDAPI_KEY ? 'Present' : 'MISSING'}`);

    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: {
                query: 'hotels in Paris',
                limit: '1',
                currency: 'USD',
                sort: 'relevance',
                lang: 'en_US'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        };

        log('Sending Request...');
        const response = await axios.request(options);

        log(`Response Status: ${response.status}`);
        log(`Data Items: ${response.data.data ? response.data.data.length : 'No data.data'}`);

        if (response.data.data && response.data.data.length > 0) {
            log('First Item Snippet:');
            log(JSON.stringify(response.data.data[0], null, 2));
        } else {
            log('Full Response Body:');
            log(JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        log('--- API Call Failed ---');
        log(`Error Message: ${error.message}`);
        if (error.response) {
            log(`Status Code: ${error.response.status}`);
            log('Error Data:');
            log(JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 403) {
                log('>>> DIAGNOSIS: 403 Forbidden. You are likely not subscribed to the Travel Advisor API on RapidAPI.');
            }
        }
    }
}

testHotelSearch();
