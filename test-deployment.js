#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * Tests the deployed Fayrelane application endpoints
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'https://fayrelane.com';
const RAILWAY_URL = 'https://fayrelane.up.railway.app';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function testEndpoint(name, url, expectedStatus = 200) {
    try {
        console.log(`🧪 Testing ${name}...`);
        const response = await makeRequest(url);

        if (response.statusCode === expectedStatus) {
            console.log(`✅ ${name}: ${response.statusCode} OK`);
            return true;
        } else {
            console.log(`❌ ${name}: Expected ${expectedStatus}, got ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${name}: Error - ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Testing Fayrelane Deployment');
    console.log('================================');

    const tests = [
        // Health check
        ['Health Check', `${DOMAIN}/health`],
        ['Health Check (Railway)', `${RAILWAY_URL}/health`],

        // Frontend pages
        ['Homepage', `${DOMAIN}/`],
        ['Listings Page', `${DOMAIN}/listings/`],
        ['Categories Page', `${DOMAIN}/categories/`],
        ['Sell Page', `${DOMAIN}/sell/`],
        ['Register Page', `${DOMAIN}/register/`],
        ['Login Page', `${DOMAIN}/login/`],

        // API endpoints (should return 404 for GET, but not 500)
        ['API Auth', `${DOMAIN}/api/auth/register`, 404], // 404 is expected for GET
    ];

    let passed = 0;
    let total = tests.length;

    for (const [name, url, expectedStatus] of tests) {
        const success = await testEndpoint(name, url, expectedStatus);
        if (success) passed++;

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n================================');
    console.log(`📊 Test Results: ${passed}/${total} passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! Deployment is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the deployment logs.');
    }

    console.log('\n🔗 Test URLs:');
    console.log(`   Custom Domain: ${DOMAIN}`);
    console.log(`   Railway URL: ${RAILWAY_URL}`);
}

// Run the tests
runTests().catch(console.error);
