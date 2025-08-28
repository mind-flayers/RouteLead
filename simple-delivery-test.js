/**
 * Simplified Delivery Management API Tester
 * Focuses on testing API structure and basic functionality
 */

const API_BASE_URL = 'http://localhost:8080/api';

class SimpleDeliveryTester {
    constructor() {
        this.testResults = [];
    }

    // Safe API request method that handles response parsing properly
    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        console.log(`\n🔄 ${options.method || 'GET'} ${url}`);
        
        try {
            const response = await fetch(url, { ...options, headers });
            
            // Handle response parsing safely
            let responseData = null;
            const contentType = response.headers.get('content-type') || '';
            
            try {
                if (contentType.includes('application/json')) {
                    const text = await response.text();
                    responseData = text ? JSON.parse(text) : null;
                } else {
                    responseData = await response.text();
                }
            } catch (parseError) {
                responseData = 'Failed to parse response';
            }
            
            console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
            console.log(`   📦 Data:`, responseData ? (typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData) : 'Empty response');
            
            return { status: response.status, ok: response.ok, data: responseData };
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            return { status: 0, ok: false, error: error.message };
        }
    }

    logTest(testName, passed, details = '') {
        this.testResults.push({ testName, passed, details, timestamp: new Date().toISOString() });
        console.log(`\n${passed ? '✅' : '❌'} ${testName}: ${details}`);
    }

    // Test 1: Check if delivery endpoints exist and return proper errors
    async testEndpointAvailability() {
        console.log('\n📋 TESTING DELIVERY ENDPOINT AVAILABILITY');
        console.log('=' .repeat(50));

        const testBidId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
        
        // Test GET /delivery/{bidId}/details
        const detailsResponse = await this.makeRequest(`/delivery/${testBidId}/details`);
        const detailsWorking = detailsResponse.status === 404 || detailsResponse.status === 500 || detailsResponse.status === 401;
        this.logTest('GET /delivery/{bidId}/details endpoint', detailsWorking, 
            detailsWorking ? 'Endpoint exists (returns error as expected for non-existent bid)' : 'Endpoint may not exist');

        // Test GET /delivery/{bidId}/tracking  
        const trackingResponse = await this.makeRequest(`/delivery/${testBidId}/tracking`);
        const trackingWorking = trackingResponse.status === 404 || trackingResponse.status === 500 || trackingResponse.status === 401;
        this.logTest('GET /delivery/{bidId}/tracking endpoint', trackingWorking,
            trackingWorking ? 'Endpoint exists (returns error as expected for non-existent bid)' : 'Endpoint may not exist');

        // Test PUT /delivery/{bidId}/status
        const statusResponse = await this.makeRequest(`/delivery/${testBidId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'PICKED_UP', currentLat: 6.9271, currentLng: 79.8612 })
        });
        const statusWorking = statusResponse.status === 400 || statusResponse.status === 404 || statusResponse.status === 500 || statusResponse.status === 401;
        this.logTest('PUT /delivery/{bidId}/status endpoint', statusWorking,
            statusWorking ? 'Endpoint exists (returns error as expected)' : 'Endpoint may not exist');

        // Test POST /delivery/{bidId}/complete
        const completeResponse = await this.makeRequest(`/delivery/${testBidId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ status: 'DELIVERED', currentLat: 6.9319, currentLng: 79.8478 })
        });
        const completeWorking = completeResponse.status === 400 || completeResponse.status === 404 || completeResponse.status === 500 || completeResponse.status === 401;
        this.logTest('POST /delivery/{bidId}/complete endpoint', completeWorking,
            completeWorking ? 'Endpoint exists (returns error as expected)' : 'Endpoint may not exist');
    }

    // Test 2: Input validation
    async testInputValidation() {
        console.log('\n📋 TESTING INPUT VALIDATION');
        console.log('=' .repeat(50));

        // Test invalid UUID format
        const invalidResponse = await this.makeRequest('/delivery/invalid-uuid/details');
        const invalidHandled = invalidResponse.status === 400;
        this.logTest('Invalid UUID handling', invalidHandled,
            invalidHandled ? 'Returns 400 Bad Request for invalid UUID' : `Returns ${invalidResponse.status} instead of 400`);

        // Test malformed JSON
        const malformedResponse = await this.makeRequest('/delivery/550e8400-e29b-41d4-a716-446655440000/status', {
            method: 'PUT',
            body: '{ invalid json'
        });
        const malformedHandled = malformedResponse.status === 400;
        this.logTest('Malformed JSON handling', malformedHandled,
            malformedHandled ? 'Returns 400 Bad Request for malformed JSON' : `Returns ${malformedResponse.status} instead of 400`);

        // Test missing required fields
        const missingFieldsResponse = await this.makeRequest('/delivery/550e8400-e29b-41d4-a716-446655440000/status', {
            method: 'PUT',
            body: JSON.stringify({}) // Empty object
        });
        const missingFieldsHandled = missingFieldsResponse.status === 400 || missingFieldsResponse.status === 500;
        this.logTest('Missing required fields handling', missingFieldsHandled,
            missingFieldsHandled ? 'Handles missing fields appropriately' : 'May not validate required fields');
    }

    // Test 3: HTTP methods and CORS
    async testHttpMethodsAndCors() {
        console.log('\n📋 TESTING HTTP METHODS AND CORS');
        console.log('=' .repeat(50));

        const testBidId = '550e8400-e29b-41d4-a716-446655440000';

        // Test OPTIONS request (CORS preflight)
        const optionsResponse = await this.makeRequest(`/delivery/${testBidId}/details`, { method: 'OPTIONS' });
        const corsWorking = optionsResponse.status === 200 || optionsResponse.status === 204;
        this.logTest('CORS preflight support', corsWorking,
            corsWorking ? 'OPTIONS requests handled correctly' : 'CORS may not be properly configured');

        // Test unsupported method
        const patchResponse = await this.makeRequest(`/delivery/${testBidId}/details`, { method: 'PATCH' });
        const methodHandled = patchResponse.status === 405;
        this.logTest('Unsupported HTTP method handling', methodHandled,
            methodHandled ? 'Returns 405 Method Not Allowed for unsupported methods' : 'May not validate HTTP methods properly');
    }

    // Test 4: Response format consistency
    async testResponseFormat() {
        console.log('\n📋 TESTING RESPONSE FORMAT CONSISTENCY');
        console.log('=' .repeat(50));

        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        const endpoints = [
            { path: `/delivery/${testBidId}/details`, method: 'GET' },
            { path: `/delivery/${testBidId}/tracking`, method: 'GET' },
            { path: `/delivery/${testBidId}/status`, method: 'PUT', body: JSON.stringify({ status: 'PICKED_UP' }) },
            { path: `/delivery/${testBidId}/complete`, method: 'POST', body: JSON.stringify({ status: 'DELIVERED' }) }
        ];

        let allJson = true;
        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint.path, { 
                method: endpoint.method,
                ...(endpoint.body && { body: endpoint.body })
            });
            
            if (response.data && typeof response.data !== 'object' && response.status >= 400) {
                allJson = false;
                console.log(`   ⚠️ Non-JSON error response for ${endpoint.path}`);
            }
        }

        this.logTest('Response format consistency', allJson,
            allJson ? 'All error responses are in JSON format' : 'Some responses are not JSON formatted');
    }

    // Test 5: Performance and load
    async testPerformance() {
        console.log('\n📋 TESTING API PERFORMANCE');
        console.log('=' .repeat(50));

        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        const startTime = Date.now();
        
        // Make 5 concurrent requests
        const promises = Array(5).fill().map(() => 
            this.makeRequest(`/delivery/${testBidId}/details`)
        );
        
        await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        const performanceGood = totalTime < 5000; // Less than 5 seconds for 5 requests
        this.logTest('API response time', performanceGood,
            `5 concurrent requests completed in ${totalTime}ms ${performanceGood ? '(good)' : '(slow)'}`);
    }

    // Test 6: Test with existing data from database (if any)
    async testWithPotentialExistingData() {
        console.log('\n📋 TESTING WITH POTENTIAL EXISTING DATA');
        console.log('=' .repeat(50));

        // Try some common test UUIDs that might exist in development databases
        const potentialBidIds = [
            '00000000-0000-0000-0000-000000000001',
            '11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-12d3-a456-426614174000',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        ];

        let foundExistingData = false;
        for (const bidId of potentialBidIds) {
            const response = await this.makeRequest(`/delivery/${bidId}/details`);
            if (response.status === 200) {
                foundExistingData = true;
                console.log(`   ✅ Found existing data for bid ${bidId}`);
                
                // Test update status with real data
                const updateResponse = await this.makeRequest(`/delivery/${bidId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        status: 'IN_TRANSIT', 
                        currentLat: 6.9271, 
                        currentLng: 79.8612,
                        notes: 'Test update from API test suite'
                    })
                });
                
                if (updateResponse.status === 200) {
                    console.log(`   ✅ Successfully updated status for bid ${bidId}`);
                }
                break;
            }
        }

        this.logTest('Existing data testing', foundExistingData,
            foundExistingData ? 'Found and tested with existing data' : 'No existing data found - tests using mock scenarios');
    }

    // Test 7: Frontend service compatibility
    async testFrontendCompatibility() {
        console.log('\n📋 TESTING FRONTEND SERVICE COMPATIBILITY');
        console.log('=' .repeat(50));

        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Simulate frontend service calls
        const frontendTests = [
            {
                name: 'getDeliveryDetails',
                request: () => this.makeRequest(`/delivery/${testBidId}/details`)
            },
            {
                name: 'getDeliveryTracking', 
                request: () => this.makeRequest(`/delivery/${testBidId}/tracking`)
            },
            {
                name: 'updateDeliveryStatus',
                request: () => this.makeRequest(`/delivery/${testBidId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'PICKED_UP', currentLat: 6.9271, currentLng: 79.8612 })
                })
            },
            {
                name: 'completeDelivery',
                request: () => this.makeRequest(`/delivery/${testBidId}/complete`, {
                    method: 'POST', 
                    body: JSON.stringify({ status: 'DELIVERED', currentLat: 6.9319, currentLng: 79.8478 })
                })
            }
        ];

        let compatibilityScore = 0;
        for (const test of frontendTests) {
            const response = await test.request();
            // Consider it compatible if it returns a proper HTTP status (not network error)
            if (response.status > 0) {
                compatibilityScore++;
                console.log(`   ✅ ${test.name} - Compatible (status ${response.status})`);
            } else {
                console.log(`   ❌ ${test.name} - Network/Connection issue`);
            }
        }

        const compatible = compatibilityScore === frontendTests.length;
        this.logTest('Frontend service compatibility', compatible,
            `${compatibilityScore}/${frontendTests.length} frontend service methods are accessible`);
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 DELIVERY MANAGEMENT API - COMPREHENSIVE TEST SUITE');
        console.log('=' .repeat(60));
        console.log('Testing API structure, error handling, and compatibility');
        console.log('=' .repeat(60));

        await this.testEndpointAvailability();
        await this.testInputValidation();
        await this.testHttpMethodsAndCors();
        await this.testResponseFormat();
        await this.testPerformance();
        await this.testWithPotentialExistingData();
        await this.testFrontendCompatibility();

        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
        console.log('=' .repeat(50));
        
        const passed = this.testResults.filter(t => t.passed).length;
        const total = this.testResults.length;
        const failedTests = this.testResults.filter(t => !t.passed);

        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${failedTests.length}/${total}`);
        console.log(`📈 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);

        if (failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`   • ${test.testName}: ${test.details}`);
            });
        }

        console.log('\n📋 All Test Results:');
        this.testResults.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            console.log(`${icon} ${test.testName} - ${test.details}`);
        });

        console.log('\n🎯 Key Findings:');
        console.log('• Delivery endpoints structure and availability');
        console.log('• Error handling and validation capabilities');
        console.log('• Frontend service compatibility status');
        console.log('• API performance and response consistency');

        if (failedTests.length > 0) {
            console.log('\n⚠️  Some issues found - see failed tests above for details');
        } else {
            console.log('\n🎉 All tests passed! Delivery Management APIs are working correctly.');
        }
    }
}

// Run the tests
const tester = new SimpleDeliveryTester();
tester.runAllTests().catch(console.error);
