const axios = require('axios'); // converted from import

const options = {
    method: 'POST',
    url: 'https://travel-advisor.p.rapidapi.com/answers/v2/list',
    params: {
        currency: 'USD',
        units: 'km',
        lang: 'en_US'
    },
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'bdfe4a1e82msh21ea4f5479b5152p1a67a1jsn0dd88333ce51', // Use env or their provided key
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
        'Content-Type': 'application/json'
    },
    data: {
        contentType: 'hotel',
        contentId: '4172546',
        questionId: '8393250',
        pagee: 0,
        updateToken: ''
    }
};

const fs = require('fs');

(async () => {
    try {
        console.log('Running User Snippet...');
        const response = await axios.request(options);
        const output = 'User Snippet Success:\n' + JSON.stringify(response.data, null, 2);
        console.log(output);
        fs.writeFileSync('snippet_out.txt', output);
    } catch (error) {
        const errorMsg = 'User Snippet Failed: ' + error.message + '\n' +
            (error.response ? 'Status: ' + error.response.status + '\nData: ' + JSON.stringify(error.response.data, null, 2) : '');
        console.error(errorMsg);
        fs.writeFileSync('snippet_out.txt', errorMsg);
    }
})();
