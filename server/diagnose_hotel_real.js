const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const run = async () => {
    console.log('--- Dumping Hotel API Response ---');
    try {
        const query = 'Paris'; // Using the query that failed for the user
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: { query, limit: '5', currency: 'USD', sort: 'relevance', lang: 'en_US' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        };

        console.log(`Sending request for query: "${query}"...`);
        const response = await axios.request(options);

        console.log('Response received.');
        const dumpPath = 'hotel_dump.json';
        fs.writeFileSync(dumpPath, JSON.stringify(response.data, null, 2));
        console.log(`Full JSON saved to ${dumpPath}`);

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            fs.writeFileSync('hotel_error_dump.json', JSON.stringify(e.response.data, null, 2));
        }
    }
};

run();
