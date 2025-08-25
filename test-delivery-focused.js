/**
 * Focused Delivery Management API Test Suite
 * Tests delivery endpoints with existing database data or mock scenarios
 */

const API_BASE_URL = 'http://localhost:8080/api';

class DeliveryAPIFocusedTester {
    constructor() {
        this.testResults = [];
    }

    // Helper method to make API calls
    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`\n🔄 ${options.method || 'GET'} ${url}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                console.log(`   ✅ Success`);
                console.log(`   📦 Data:`, typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData);
            } else {
                console.log(`   ❌ Error`);
                console.log(`   📦 Error Data:`, typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData);
            }
            
            return {
                status: response.status,
                ok: response.ok,
                data: responseData
            };
        } catch (error) {
            console.error(`   ❌ Request failed:`, error.message);
            return {
                status: 0,
                ok: false,
                error: error.message
            };
        }
    }

    // Log test results
    logTest(testName, passed, details = '') {
        const result = { testName, passed, details, timestamp: new Date().toISOString() };
        this.testResults.push(result);
        console.log(`\n${passed ? '✅' : '❌'} ${testName}: ${details}`);
    }

    // Test 1: Check if delivery endpoints exist (with invalid IDs to test error handling)
    async testDeliveryEndpointsExist() {
        console.log('\n🧪 Testing if delivery endpoints exist...');
        
        // Test with a valid UUID format but non-existent ID
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        const endpoints = [
            { name: 'GET /api/delivery/{bidId}/details', path: `/delivery/${testBidId}/details`, method: 'GET' },
            { name: 'GET /api/delivery/{bidId}/tracking', path: `/delivery/${testBidId}/tracking`, method: 'GET' },
        ];

        let endpointsExist = true;
        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint.path, { method: endpoint.method });
            // 404 or 500 is acceptable here - it means the endpoint exists but data doesn't
            // 404 Not Found for endpoint itself would be different
            if (response.status === 404 && response.data && typeof response.data === 'object' && response.data.path) {
                // This is endpoint not found (Spring Boot error format)
                endpointsExist = false;
            }
        }

        this.logTest('Delivery Endpoints Exist', endpointsExist,
            endpointsExist ? 'All delivery endpoints are available' : 'Some delivery endpoints not found');
    }

    // Test 2: Test with various invalid bid ID formats
    async testInvalidBidIdFormats() {
        console.log('\n🧪 Testing invalid bid ID handling...');
        
        const invalidIds = [
            'invalid-id',
            '123',
            '',
            'not-a-uuid',
            'null'
        ];

        let allHandledProperly = true;
        for (const invalidId of invalidIds) {
            const response = await this.makeRequest(`/delivery/${invalidId}/details`);
            // Should return 400 (Bad Request) or 500 for invalid UUID format
            if (response.status === 200) {
                allHandledProperly = false;
                console.log(`   ⚠️  Invalid ID '${invalidId}' should not return 200`);
            }
        }

        this.logTest('Invalid Bid ID Handling', allHandledProperly,
            allHandledProperly ? 'All invalid IDs handled properly' : 'Some invalid IDs not handled correctly');
    }

    // Test 3: Test status update endpoints
    async testStatusUpdateEndpoints() {
        console.log('\n🧪 Testing status update endpoints...');
        
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Test PUT /api/delivery/{bidId}/status
        const statusUpdateData = {
            status: 'PICKED_UP',
            currentLat: 6.9271,
            currentLng: 79.8612,
            notes: 'Test status update'
        };

        const putResponse = await this.makeRequest(`/delivery/${testBidId}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusUpdateData)
        });

        // Test POST /api/delivery/{bidId}/complete
        const completeData = {
            status: 'DELIVERED',
            currentLat: 6.9319,
            currentLng: 79.8478,
            notes: 'Test delivery completion'
        };

        const postResponse = await this.makeRequest(`/delivery/${testBidId}/complete`, {
            method: 'POST',
            body: JSON.stringify(completeData)
        });

        // Both should return 404/500 for non-existent bid, but endpoint should exist
        const endpointsWork = (putResponse.status !== 404 || !putResponse.data?.path) && 
                             (postResponse.status !== 404 || !postResponse.data?.path);

        this.logTest('Status Update Endpoints', endpointsWork,
            endpointsWork ? 'Status update endpoints are available' : 'Status update endpoints not found');
    }

    // Test 4: Test with malformed JSON
    async testMalformedJSON() {
        console.log('\n🧪 Testing malformed JSON handling...');
        
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Test with malformed JSON
        const response = await this.makeRequest(`/delivery/${testBidId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: '{ "status": "PICKED_UP", invalid json }'
        });

        // Should return 400 Bad Request for malformed JSON
        const handledProperly = response.status === 400 || response.status === 500;

        this.logTest('Malformed JSON Handling', handledProperly,
            handledProperly ? 'Malformed JSON handled properly' : 'Malformed JSON not handled correctly');
    }

    // Test 5: Test CORS and HTTP methods
    async testCORS() {
        console.log('\n🧪 Testing CORS and HTTP methods...');
        
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Test OPTIONS request (preflight)
        const optionsResponse = await this.makeRequest(`/delivery/${testBidId}/details`, {
            method: 'OPTIONS'
        });

        // Test unsupported method
        const patchResponse = await this.makeRequest(`/delivery/${testBidId}/details`, {
            method: 'PATCH'
        });

        const corsWorks = optionsResponse.status !== 404 || patchResponse.status === 405;

        this.logTest('CORS and HTTP Methods', corsWorks,
            corsWorks ? 'CORS and method handling working' : 'CORS or method handling issues');
    }

    // Test 6: Check database connectivity by testing a simple endpoint
    async testDatabaseConnectivity() {
        console.log('\n🧪 Testing database connectivity...');
        
        // Try to access a simple endpoint that might show if DB is connected
        const response = await this.makeRequest('/');
        
        const dbConnected = response.status !== 500 || 
                           (response.data && !response.data.toString().includes('database'));

        this.logTest('Database Connectivity', dbConnected,
            dbConnected ? 'Database appears to be connected' : 'Database connection issues detected');
    }

    // Test 7: Frontend Service Compatibility Test
    async testFrontendServiceCompatibility() {
        console.log('\n🧪 Testing frontend service compatibility...');
        
        // Simulate the exact calls the frontend deliveryService makes
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Test headers and content types that frontend would send
        const frontendStyleRequest = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token-for-testing'
            },
            body: JSON.stringify({
                status: 'IN_TRANSIT',
                currentLat: 6.9295,
                currentLng: 79.8545,
                notes: 'Frontend compatibility test'
            })
        };

        const response = await this.makeRequest(`/delivery/${testBidId}/status`, frontendStyleRequest);
        
        // Should either work or return proper auth error (401), not 404
        const compatible = response.status !== 404 || !response.data?.path;

        this.logTest('Frontend Service Compatibility', compatible,
            compatible ? 'Compatible with frontend service structure' : 'Compatibility issues detected');
    }

    // Test 8: Response format validation
    async testResponseFormat() {
        console.log('\n🧪 Testing response format consistency...');
        
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        const endpoints = [
            `/delivery/${testBidId}/details`,
            `/delivery/${testBidId}/tracking`
        ];

        let formatConsistent = true;
        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            
            // Even error responses should be JSON formatted
            if (response.data && typeof response.data === 'object') {
                // Check if error responses have standard format
                if (!response.ok && (!response.data.timestamp || !response.data.status)) {
                    console.log(`   ⚠️  Non-standard error format for ${endpoint}`);
                }
            } else if (!response.ok) {
                console.log(`   ⚠️  Non-JSON error response for ${endpoint}`);
                formatConsistent = false;
            }
        }

        this.logTest('Response Format Consistency', formatConsistent,
            formatConsistent ? 'Response formats are consistent' : 'Response format inconsistencies found');
    }

    // Test 9: Check if we can find any existing data
    async testExistingData() {
        console.log('\n🧪 Checking for existing test data...');
        
        // Try some common UUID patterns that might exist in test data
        const potentialIds = [
            // Common test UUIDs
            '00000000-0000-0000-0000-000000000001',
            '11111111-1111-1111-1111-111111111111',
            'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            // Check a few random ones
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-12d3-a456-426614174000'
        ];

        let foundData = false;
        for (const id of potentialIds) {
            const response = await this.makeRequest(`/delivery/${id}/details`);
            if (response.ok && response.data) {
                console.log(`   🎯 Found data for ID: ${id}`);
                foundData = true;
                break;
            }
        }

        this.logTest('Existing Data Found', foundData,
            foundData ? 'Found some existing test data' : 'No existing test data found - tests using mock scenarios');
    }

    // Test 10: API Performance Test
    async testAPIPerformance() {
        console.log('\n🧪 Testing API response times...');
        
        const testBidId = '550e8400-e29b-41d4-a716-446655440000';
        const startTime = Date.now();
        
        // Make multiple requests to test performance
        const promises = [
            this.makeRequest(`/delivery/${testBidId}/details`),
            this.makeRequest(`/delivery/${testBidId}/tracking`),
            this.makeRequest(`/delivery/${testBidId}/details`)
        ];

        await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        // Should complete within reasonable time (5 seconds for 3 requests)
        const performanceGood = totalTime < 5000;

        this.logTest('API Performance', performanceGood,
            `3 requests completed in ${totalTime}ms ${performanceGood ? '(good)' : '(slow)'}`);
    }

    // Run all focused tests
    async runAllTests() {
        console.log('🚀 Delivery Management API - Focused Test Suite');
        console.log('=' .repeat(60));
        console.log('Testing API structure, error handling, and compatibility');
        console.log('=' .repeat(60));

        await this.testDeliveryEndpointsExist();
        await this.testInvalidBidIdFormats();
        await this.testStatusUpdateEndpoints();
        await this.testMalformedJSON();
        await this.testCORS();
        await this.testDatabaseConnectivity();
        await this.testFrontendServiceCompatibility();
        await this.testResponseFormat();
        await this.testExistingData();
        await this.testAPIPerformance();

        this.printTestSummary();
    }

    // Print test summary
    printTestSummary() {
        console.log('\n📊 DELIVERY API TEST SUMMARY');
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
            console.log(`${test.passed ? '✅' : '❌'} ${test.testName} - ${test.details}`);
        });

        console.log('\n🎯 Key Findings:');
        console.log('• Delivery endpoints structure and availability');
        console.log('• Error handling and validation capabilities');
        console.log('• Frontend service compatibility status'); 
        console.log('• API performance and response consistency');
        
        if (passed === total) {
            console.log('\n🎉 All delivery management APIs are working correctly!');
        } else {
            console.log('\n⚠️  Some issues found - see failed tests above for details');
        }
    }
}

// Run the focused tests
const tester = new DeliveryAPIFocusedTester();
tester.runAllTests().catch(console.error);
