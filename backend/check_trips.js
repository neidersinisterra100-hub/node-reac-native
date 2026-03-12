const axios = require('axios');

async function testFetch() {
    try {
        const response = await axios.get('http://localhost:3000/api/trips');
        console.log("Total trips:", response.data.length);
        if (response.data.length > 0) {
            console.log("Sample trip:");
            console.log(JSON.stringify(response.data[0], null, 2));
        }
        
        const routesResponse = await axios.get('http://localhost:3000/api/routes');
        console.log("\nTotal routes:", routesResponse.data.length);
        if (routesResponse.data.length > 0) {
            console.log("Sample route:");
            console.log(JSON.stringify(routesResponse.data[0], null, 2));
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

testFetch();
