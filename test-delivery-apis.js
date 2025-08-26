/**
 * Comprehensive Test Suite for Delivery Management APIs
 * Tests all delivery-related endpoints with various scenarios
 */

const API_BASE_URL = 'http://localhost:8080/api';

class DeliveryAPITester {
    constructor() {
        this.testResults = [];
        this.authToken = null;
    }

    // Helper method to make authenticated API calls
    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
            ...options.headers,
        };

        console.log(`\n🔄 Making ${options.method || 'GET'} request to: ${url}`);
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const responseData = response.ok ? await response.json() : await response.text();
            
            console.log(`✅ Response Status: ${response.status}`);
            console.log(`📦 Response Data:`, typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData);
            
            return {
                status: response.status,
                ok: response.ok,
                data: responseData
            };
        } catch (error) {
            console.error(`❌ Request failed:`, error.message);
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

    // Setup: Create test data (driver, customer, parcel request, route, bid)
    async setupTestData() {
        console.log('\n🔧 Setting up test data...');
        
        try {
            // 1. Register a test driver
            const driverData = {
                firstName: "John",
                lastName: "Driver",
                email: "driver.test@routelead.com",
                password: "password123",
                phoneNumber: "+94771234567"
            };

            const driverRegResponse = await this.makeRequest('/auth/register/driver', {
                method: 'POST',
                body: JSON.stringify(driverData)
            });

            if (!driverRegResponse.ok) {
                console.log('Driver may already exist, trying to login...');
                const driverLoginResponse = await this.makeRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: driverData.email,
                        password: driverData.password
                    })
                });
                
                if (driverLoginResponse.ok) {
                    this.authToken = driverLoginResponse.data.token;
                    this.driverId = driverLoginResponse.data.userId;
                }
            } else {
                this.authToken = driverRegResponse.data.token;
                this.driverId = driverRegResponse.data.userId;
            }

            // 2. Register a test customer
            const customerData = {
                firstName: "Jane",
                lastName: "Customer",
                email: "customer.test@routelead.com",
                password: "password123",
                phoneNumber: "+94777654321"
            };

            const customerRegResponse = await this.makeRequest('/auth/register/customer', {
                method: 'POST',
                body: JSON.stringify(customerData)
            });

            if (customerRegResponse.ok || customerRegResponse.status === 409) {
                // Customer created or already exists
                console.log('✅ Customer setup completed');
            }

            // 3. Create a route for the driver
            const routeData = {
                driverId: this.driverId,
                startLat: 6.9271,
                startLng: 79.8612,
                endLat: 6.9319,
                endLng: 79.8478,
                departureTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                maxCapacityKg: 100,
                maxVolumeM3: 2.0,
                costPerKm: 50.0
            };

            const routeResponse = await this.makeRequest('/routes', {
                method: 'POST',
                body: JSON.stringify(routeData)
            });

            if (routeResponse.ok) {
                this.routeId = routeResponse.data.id;
                console.log('✅ Route created:', this.routeId);
            }

            // 4. Login as customer to create parcel request
            const customerLoginResponse = await this.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: customerData.email,
                    password: customerData.password
                })
            });

            if (customerLoginResponse.ok) {
                this.customerToken = customerLoginResponse.data.token;
                this.customerId = customerLoginResponse.data.userId;
                
                // 5. Create a parcel request
                const parcelData = {
                    pickupLat: 6.9271,
                    pickupLng: 79.8612,
                    dropoffLat: 6.9319,
                    dropoffLng: 79.8478,
                    weightKg: 5.0,
                    volumeM3: 0.5,
                    description: "Test delivery package",
                    maxBudget: 1000,
                    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
                    pickupContactName: "John Pickup",
                    pickupContactPhone: "+94771111111",
                    deliveryContactName: "Jane Delivery",
                    deliveryContactPhone: "+94772222222"
                };

                const parcelResponse = await this.makeRequest('/parcel-requests', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${this.customerToken}` },
                    body: JSON.stringify(parcelData)
                });

                if (parcelResponse.ok) {
                    this.parcelRequestId = parcelResponse.data.id;
                    console.log('✅ Parcel request created:', this.parcelRequestId);
                }

                // 6. Switch back to driver and place a bid
                const bidData = {
                    requestId: this.parcelRequestId,
                    routeId: this.routeId,
                    offeredPrice: 800,
                    estimatedPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                    specialInstructions: "Handle with care"
                };

                const bidResponse = await this.makeRequest('/bids', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${this.authToken}` },
                    body: JSON.stringify(bidData)
                });

                if (bidResponse.ok) {
                    this.bidId = bidResponse.data.id;
                    console.log('✅ Bid created:', this.bidId);
                    
                    // 7. Accept the bid (as customer)
                    const acceptResponse = await this.makeRequest(`/customer-bids/${this.bidId}/accept`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${this.customerToken}` }
                    });

                    if (acceptResponse.ok) {
                        console.log('✅ Bid accepted');
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Setup failed:', error);
            return false;
        }
    }

    // Test 1: Get Delivery Details
    async testGetDeliveryDetails() {
        if (!this.bidId) {
            this.logTest('Get Delivery Details', false, 'No bid ID available');
            return;
        }

        const response = await this.makeRequest(`/delivery/${this.bidId}/details`, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
        });

        const passed = response.ok && response.data && response.data.bidId;
        this.logTest('Get Delivery Details', passed, 
            passed ? `Retrieved delivery details for bid ${this.bidId}` : `Failed: ${response.status}`);
        
        if (passed) {
            this.deliveryDetails = response.data;
        }
    }

    // Test 2: Update Delivery Status - PICKED_UP
    async testUpdateStatusPickedUp() {
        if (!this.bidId) {
            this.logTest('Update Status to PICKED_UP', false, 'No bid ID available');
            return;
        }

        const updateData = {
            status: 'PICKED_UP',
            currentLat: 6.9271,
            currentLng: 79.8612,
            notes: 'Package picked up from sender'
        };

        const response = await this.makeRequest(`/delivery/${this.bidId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            body: JSON.stringify(updateData)
        });

        const passed = response.ok && response.data && response.data.status === 'PICKED_UP';
        this.logTest('Update Status to PICKED_UP', passed,
            passed ? 'Status updated to PICKED_UP successfully' : `Failed: ${response.status}`);
    }

    // Test 3: Update Delivery Status - IN_TRANSIT
    async testUpdateStatusInTransit() {
        if (!this.bidId) {
            this.logTest('Update Status to IN_TRANSIT', false, 'No bid ID available');
            return;
        }

        const updateData = {
            status: 'IN_TRANSIT',
            currentLat: 6.9295,
            currentLng: 79.8545,
            notes: 'Package is on the way to destination'
        };

        const response = await this.makeRequest(`/delivery/${this.bidId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            body: JSON.stringify(updateData)
        });

        const passed = response.ok && response.data && response.data.status === 'IN_TRANSIT';
        this.logTest('Update Status to IN_TRANSIT', passed,
            passed ? 'Status updated to IN_TRANSIT successfully' : `Failed: ${response.status}`);
    }

    // Test 4: Get Delivery Tracking
    async testGetDeliveryTracking() {
        if (!this.bidId) {
            this.logTest('Get Delivery Tracking', false, 'No bid ID available');
            return;
        }

        const response = await this.makeRequest(`/delivery/${this.bidId}/tracking`, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
        });

        const passed = response.ok && response.data && response.data.bidId;
        this.logTest('Get Delivery Tracking', passed,
            passed ? 'Retrieved delivery tracking data successfully' : `Failed: ${response.status}`);
    }

    // Test 5: Complete Delivery
    async testCompleteDelivery() {
        if (!this.bidId) {
            this.logTest('Complete Delivery', false, 'No bid ID available');
            return;
        }

        const updateData = {
            status: 'DELIVERED',
            currentLat: 6.9319,
            currentLng: 79.8478,
            notes: 'Package delivered successfully to recipient'
        };

        const response = await this.makeRequest(`/delivery/${this.bidId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            body: JSON.stringify(updateData)
        });

        const passed = response.ok && response.data && response.data.deliveryCompletedAt;
        this.logTest('Complete Delivery', passed,
            passed ? 'Delivery completed successfully' : `Failed: ${response.status}`);
        
        if (passed) {
            this.deliverySummary = response.data;
        }
    }

    // Test 6: Error Handling - Invalid Bid ID
    async testInvalidBidId() {
        const invalidBidId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID format but non-existent

        const response = await this.makeRequest(`/delivery/${invalidBidId}/details`, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
        });

        const passed = !response.ok && (response.status === 404 || response.status === 500);
        this.logTest('Error Handling - Invalid Bid ID', passed,
            passed ? 'Properly handled invalid bid ID' : 'Should have returned error for invalid bid ID');
    }

    // Test 7: Unauthorized Access
    async testUnauthorizedAccess() {
        if (!this.bidId) {
            this.logTest('Unauthorized Access', false, 'No bid ID available');
            return;
        }

        const response = await this.makeRequest(`/delivery/${this.bidId}/details`);

        const passed = !response.ok && response.status === 401;
        this.logTest('Unauthorized Access', passed,
            passed ? 'Properly handled unauthorized access' : 'Should have returned 401 for unauthorized access');
    }

    // Test 8: Invalid Status Update
    async testInvalidStatusUpdate() {
        if (!this.bidId) {
            this.logTest('Invalid Status Update', false, 'No bid ID available');
            return;
        }

        const updateData = {
            status: 'INVALID_STATUS',
            currentLat: 6.9295,
            currentLng: 79.8545
        };

        const response = await this.makeRequest(`/delivery/${this.bidId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            body: JSON.stringify(updateData)
        });

        const passed = !response.ok && (response.status === 400 || response.status === 500);
        this.logTest('Invalid Status Update', passed,
            passed ? 'Properly handled invalid status' : 'Should have returned error for invalid status');
    }

    // Test 9: Test Missing Location Data
    async testMissingLocationData() {
        if (!this.bidId) {
            this.logTest('Missing Location Data', false, 'No bid ID available');
            return;
        }

        const updateData = {
            status: 'IN_TRANSIT',
            notes: 'Testing without location data'
        };

        const response = await this.makeRequest(`/delivery/${this.bidId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            body: JSON.stringify(updateData)
        });

        const passed = response.ok; // Should still work without location data
        this.logTest('Missing Location Data', passed,
            passed ? 'Status update works without location data' : 'Failed to update status without location');
    }

    // Test 10: Frontend Service Integration
    async testFrontendServiceIntegration() {
        // This test simulates how the frontend deliveryService would work
        console.log('\n🔧 Testing Frontend Service Integration...');
        
        try {
            // Simulate the frontend API base URL configuration
            const frontendApiBase = 'http://localhost:8080/api';
            
            // Test the exact endpoints the frontend uses
            const endpoints = [
                { name: 'getDeliveryDetails', path: `/delivery/${this.bidId}/details`, method: 'GET' },
                { name: 'updateDeliveryStatus', path: `/delivery/${this.bidId}/status`, method: 'PUT' },
                { name: 'completeDelivery', path: `/delivery/${this.bidId}/complete`, method: 'POST' },
                { name: 'getDeliveryTracking', path: `/delivery/${this.bidId}/tracking`, method: 'GET' }
            ];

            let allPassed = true;
            for (const endpoint of endpoints) {
                const response = await this.makeRequest(endpoint.path, {
                    method: endpoint.method,
                    headers: { 'Authorization': `Bearer ${this.authToken}` },
                    ...(endpoint.method !== 'GET' && {
                        body: JSON.stringify({ status: 'IN_TRANSIT', currentLat: 6.9295, currentLng: 79.8545 })
                    })
                });

                if (!response.ok) {
                    allPassed = false;
                    console.log(`❌ Frontend endpoint ${endpoint.name} failed`);
                }
            }

            this.logTest('Frontend Service Integration', allPassed,
                allPassed ? 'All frontend endpoints working correctly' : 'Some frontend endpoints failed');
                
        } catch (error) {
            this.logTest('Frontend Service Integration', false, `Error: ${error.message}`);
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Delivery Management API Test Suite');
        console.log('=' .repeat(70));

        // Setup test data
        const setupSuccess = await this.setupTestData();
        if (!setupSuccess) {
            console.log('❌ Setup failed. Cannot proceed with tests.');
            return;
        }

        console.log('\n📋 Running API Tests...');
        console.log('=' .repeat(50));

        // Run all tests
        await this.testGetDeliveryDetails();
        await this.testUpdateStatusPickedUp();
        await this.testUpdateStatusInTransit();
        await this.testGetDeliveryTracking();
        await this.testCompleteDelivery();
        await this.testInvalidBidId();
        await this.testUnauthorizedAccess();
        await this.testInvalidStatusUpdate();
        await this.testMissingLocationData();
        await this.testFrontendServiceIntegration();

        // Print summary
        this.printTestSummary();
    }

    // Print test summary
    printTestSummary() {
        console.log('\n📊 TEST SUMMARY');
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

        console.log('\n📋 Detailed Results:');
        this.testResults.forEach(test => {
            console.log(`${test.passed ? '✅' : '❌'} ${test.testName}`);
        });

        // Save results to file
        const resultsFile = JSON.stringify({
            summary: { passed, total, successRate: (passed/total) * 100 },
            tests: this.testResults,
            generatedAt: new Date().toISOString()
        }, null, 2);

        console.log(`\n💾 Test results saved. You can save to file if needed.`);
    }
}

// Run the tests
const tester = new DeliveryAPITester();
tester.runAllTests().catch(console.error);
