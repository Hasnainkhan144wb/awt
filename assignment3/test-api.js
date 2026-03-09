const http = require('http');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { resolve({ status: res.statusCode, body: data }); });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testAPIs() {
    console.log('=== Testing Auth Endpoints ===\n');

    // Test Register
    console.log('1. Testing POST /api/v1/auth/register');
    const registerData = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234!'
    });
    const registerRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(registerData)
        }
    }, registerData);
    console.log('Status:', registerRes.status);
    console.log('Response:', registerRes.body);
    console.log('');

    // Test Login
    console.log('2. Testing POST /api/v1/auth/login');
    const loginData = JSON.stringify({
        email: 'test@example.com',
        password: 'Test1234!'
    });
    const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    }, loginData);
    console.log('Status:', loginRes.status);
    console.log('Response:', loginRes.body);
    console.log('');

    // Test Get Posts
    console.log('3. Testing GET /api/v1/posts');
    const postsRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/posts',
        method: 'GET'
    });
    console.log('Status:', postsRes.status);
    console.log('Response:', postsRes.body);
    console.log('');

    // Test Get Categories
    console.log('4. Testing GET /api/v1/categories');
    const categoriesRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/categories',
        method: 'GET'
    });
    console.log('Status:', categoriesRes.status);
    console.log('Response:', categoriesRes.body);
    console.log('');

    console.log('=== All Tests Completed ===');
}

testAPIs().catch(console.error);
