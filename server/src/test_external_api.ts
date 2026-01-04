import 'dotenv/config';
import axios from 'axios';

const testFlightApi = async () => {
    const apiKey = process.env.FLIGHT_API_KEY;
    const from = 'LHR';
    const to = 'JFK';
    const date = '2020-01-01'; // Past date
    const url = `https://api.flightapi.io/onewaytrip/${apiKey}/${from}/${to}/${date}/1/0/0/Economy/USD`;

    console.log(`Testing URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

testFlightApi();
