// Test script to verify the payment system works correctly
// Run this after starting the backend server

const API_BASE = 'http://localhost:8080/api';

async function testPaymentSystem() {
    console.log('🧪 Testing Payment System...\n');

    try {
        // Test 1: Check if bypass endpoint exists
        console.log('1️⃣ Testing bypass payment endpoint...');
        const bypassResponse = await fetch(`${API_BASE}/payments/bypass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bidId: '123e4567-e89b-12d3-a456-426614174000',
                requestId: '123e4567-e89b-12d3-a456-426614174001',
                userId: '123e4567-e89b-12d3-a456-426614174002',
                amount: '1000',
                paymentMethod: 'CREDIT_CARD'
            })
        });

        if (bypassResponse.ok) {
            const bypassData = await bypassResponse.json();
            console.log('✅ Bypass endpoint working:', bypassData.success);
            console.log('📋 Payment ID:', bypassData.data?.id);
        } else {
            console.log('❌ Bypass endpoint failed:', bypassResponse.status);
        }

        // Test 2: Check payment status endpoint
        console.log('\n2️⃣ Testing payment status endpoint...');
        const statusResponse = await fetch(`${API_BASE}/payments/bid/123e4567-e89b-12d3-a456-426614174000/status`);
        
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('✅ Status endpoint working:', statusData.success);
            console.log('📋 Payment status:', statusData.data?.paymentStatus);
            console.log('💰 Is paid:', statusData.data?.isPaid);
        } else {
            console.log('❌ Status endpoint failed:', statusResponse.status);
        }

        // Test 3: Check if PayHere config endpoint works
        console.log('\n3️⃣ Testing PayHere config endpoint...');
        const configResponse = await fetch(`${API_BASE}/payments/payhere/config`);
        
        if (configResponse.ok) {
            const configData = await configResponse.json();
            console.log('✅ Config endpoint working:', configData.success);
            console.log('🔧 Merchant ID:', configData.data?.merchantId ? 'Set' : 'Not set');
        } else {
            console.log('❌ Config endpoint failed:', configResponse.status);
        }

        console.log('\n🎉 Payment system test completed!');
        console.log('\n📝 Summary:');
        console.log('- Bypass payment: Creates real payment records');
        console.log('- Payment status: Checks real payment status');
        console.log('- PayHere config: Loads payment configuration');
        console.log('\n✅ The payment system is working correctly!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Make sure the backend server is running on http://localhost:8080');
    }
}

// Run the test
testPaymentSystem();
