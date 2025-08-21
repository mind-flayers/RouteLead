// Test Backend APIs directly
const crypto = require('crypto');

console.log('🧪 Testing Backend APIs directly...\n');

// Your sandbox credentials
const credentials = {
  merchantId: "1231712",
  merchantSecret: "MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5"
};

// Test data
const testData = {
  orderId: "TEST_" + Date.now(),
  amount: "1000.00",
  currency: "LKR",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "0712345678",
  address: "Test Address",
  city: "Colombo",
  country: "Sri Lanka",
  items: "Test Item"
};

// Test 1: Backend Configuration API
async function testBackendConfig() {
  try {
    console.log('1. 🔧 Testing Backend Configuration API...');
    
    const response = await fetch('http://localhost:8080/api/payments/payhere/config');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backend configuration API working');
      console.log('   Merchant ID:', result.data.merchantId);
      console.log('   Sandbox URL:', result.data.sandboxUrl);
      console.log('   Currency:', result.data.currency);
      return result.data;
    } else {
      console.log('❌ Backend configuration API failed:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend configuration API error:', error.message);
    return null;
  }
}

// Test 2: Backend Hash Generation API
async function testBackendHash() {
  try {
    console.log('\n2. 🔐 Testing Backend Hash Generation API...');
    
    const response = await fetch('http://localhost:8080/api/payments/payhere/generate-hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: testData.orderId,
        amount: testData.amount,
        currency: testData.currency,
        first_name: testData.firstName,
        last_name: testData.lastName,
        email: testData.email,
        phone: testData.phone,
        address: testData.address,
        city: testData.city,
        country: testData.country,
        items: testData.items
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backend hash generation API working');
      console.log('   Generated Hash:', result.hash);
      
      // Verify hash locally
      const hashString = credentials.merchantId +
        testData.orderId +
        testData.amount +
        testData.currency +
        testData.firstName +
        testData.lastName +
        testData.email +
        testData.phone +
        testData.address +
        testData.city +
        testData.country +
        testData.items +
        credentials.merchantSecret;
      
      const localHash = crypto.createHash('md5').update(hashString, 'utf8').digest('hex').toUpperCase();
      console.log('   Local Hash:', localHash);
      console.log('   Hash Match:', result.hash === localHash ? '✅' : '❌');
      
      return result.hash;
    } else {
      console.log('❌ Backend hash generation API failed:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend hash generation API error:', error.message);
    return null;
  }
}

// Test 3: Backend Checkout API
async function testBackendCheckout(hash) {
  try {
    console.log('\n3. 💳 Testing Backend Checkout API...');
    
    const response = await fetch('http://localhost:8080/api/payments/payhere/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bidId: "test-bid-id",
        requestId: "test-request-id", 
        userId: "test-user-id",
        amount: testData.amount,
        paymentMethod: "CREDIT_CARD"
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backend checkout API working');
      console.log('   Response:', JSON.stringify(result, null, 2));
      return result.data;
    } else {
      console.log('❌ Backend checkout API failed:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend checkout API error:', error.message);
    return null;
  }
}

// Test 4: Test with ngrok URL
async function testNgrokConfig() {
  try {
    console.log('\n4. 🌐 Testing Backend via Ngrok...');
    
    const response = await fetch('https://765fb61e0f58.ngrok-free.app/api/payments/payhere/config');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Ngrok connection working');
      console.log('   Merchant ID:', result.data.merchantId);
      return true;
    } else {
      console.log('❌ Ngrok connection failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Ngrok connection error:', error.message);
    return false;
  }
}

// Test 5: Create a form that calls your backend first
function createBackendTestForm() {
  console.log('\n5. 🧪 Creating Backend Test Form...');
  
  const fs = require('fs');
  
  const htmlForm = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Backend Test</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
        .debug-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 12px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .log { margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Backend Test</h2>
        <p>This form will call your backend APIs before submitting to PayHere.</p>
        
        <div class="form-group">
            <label>Test Data:</label>
            <input type="text" id="testData" value='${JSON.stringify(testData)}' readonly>
        </div>
        
        <button onclick="testBackendAPIs()">Test Backend APIs</button>
        <button onclick="testNgrokAPIs()">Test Ngrok APIs</button>
        <button onclick="submitToPayHere()">Submit to PayHere</button>
        
        <div class="log" id="log"></div>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="success">✅ This form will call your backend APIs</span><br>
            <span class="success">✅ Check the log above for API responses</span><br>
            <span class="success">✅ Then submit to PayHere with generated data</span><br>
            <br>
            <strong>Test Flow:</strong><br>
            1. Click "Test Backend APIs" to verify backend is working<br>
            2. Click "Test Ngrok APIs" to verify ngrok connection<br>
            3. Click "Submit to PayHere" to test payment flow<br>
        </div>
    </div>

    <script>
        function log(message) {
            const logDiv = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logDiv.innerHTML += '[' + timestamp + '] ' + message + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        async function testBackendAPIs() {
            log('Testing Backend APIs...');
            
            try {
                // Test config API
                log('1. Testing config API...');
                const configResponse = await fetch('http://localhost:8080/api/payments/payhere/config');
                const configResult = await configResponse.json();
                log('Config API Response: ' + JSON.stringify(configResult));
                
                // Test hash generation API
                log('2. Testing hash generation API...');
                const hashResponse = await fetch('http://localhost:8080/api/payments/payhere/generate-hash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: '${testData.orderId}',
                        amount: '${testData.amount}',
                        currency: '${testData.currency}',
                        first_name: '${testData.firstName}',
                        last_name: '${testData.lastName}',
                        email: '${testData.email}',
                        phone: '${testData.phone}',
                        address: '${testData.address}',
                        city: '${testData.city}',
                        country: '${testData.country}',
                        items: '${testData.items}'
                    })
                });
                const hashResult = await hashResponse.json();
                log('Hash API Response: ' + JSON.stringify(hashResult));
                
                log('✅ Backend APIs tested successfully');
                
            } catch (error) {
                log('❌ Backend API Error: ' + error.message);
            }
        }

        async function testNgrokAPIs() {
            log('Testing Ngrok APIs...');
            
            try {
                const response = await fetch('https://765fb61e0f58.ngrok-free.app/api/payments/payhere/config');
                const result = await response.json();
                log('Ngrok API Response: ' + JSON.stringify(result));
                log('✅ Ngrok APIs tested successfully');
                
            } catch (error) {
                log('❌ Ngrok API Error: ' + error.message);
            }
        }

        async function submitToPayHere() {
            log('Submitting to PayHere...');
            
            try {
                // First get hash from backend
                log('1. Getting hash from backend...');
                const hashResponse = await fetch('http://localhost:8080/api/payments/payhere/generate-hash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: '${testData.orderId}',
                        amount: '${testData.amount}',
                        currency: '${testData.currency}',
                        first_name: '${testData.firstName}',
                        last_name: '${testData.lastName}',
                        email: '${testData.email}',
                        phone: '${testData.phone}',
                        address: '${testData.address}',
                        city: '${testData.city}',
                        country: '${testData.country}',
                        items: '${testData.items}'
                    })
                });
                const hashResult = await hashResponse.json();
                
                if (hashResult.success) {
                    log('2. Hash generated: ' + hashResult.hash);
                    
                    // Create form data
                    const formData = {
                        merchant_id: '${credentials.merchantId}',
                        return_url: 'https://765fb61e0f58.ngrok-free.app/api/payments/return',
                        cancel_url: 'https://765fb61e0f58.ngrok-free.app/api/payments/cancel',
                        notify_url: 'https://765fb61e0f58.ngrok-free.app/api/payments/webhook',
                        first_name: '${testData.firstName}',
                        last_name: '${testData.lastName}',
                        email: '${testData.email}',
                        phone: '${testData.phone}',
                        address: '${testData.address}',
                        city: '${testData.city}',
                        country: '${testData.country}',
                        order_id: '${testData.orderId}',
                        items: '${testData.items}',
                        currency: '${testData.currency}',
                        amount: '${testData.amount}',
                        custom_1: 'test-bid-id',
                        custom_2: 'test-request-id',
                        custom_3: 'test-user-id',
                        custom_4: 'CREDIT_CARD',
                        hash: hashResult.hash
                    };
                    
                    log('3. Form data prepared: ' + JSON.stringify(formData));
                    
                    // Submit to PayHere
                    log('4. Submitting to PayHere...');
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = 'https://sandbox.payhere.lk/pay/checkout';
                    form.style.display = 'none';
                    
                    Object.entries(formData).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value;
                        form.appendChild(input);
                    });
                    
                    document.body.appendChild(form);
                    form.submit();
                    
                } else {
                    log('❌ Hash generation failed: ' + hashResult.message);
                }
                
            } catch (error) {
                log('❌ Submit Error: ' + error.message);
            }
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('payhere-backend-test.html', htmlForm);
  console.log('✅ Created payhere-backend-test.html');
}

// Run all tests
async function runTests() {
  console.log('🧪 Running Backend API Tests...\n');
  
  const config = await testBackendConfig();
  const hash = await testBackendHash();
  const checkout = await testBackendCheckout(hash);
  const ngrok = await testNgrokConfig();
  
  createBackendTestForm();
  
  console.log('\n📋 Test Summary:');
  console.log('Backend Config API:', config ? '✅' : '❌');
  console.log('Backend Hash API:', hash ? '✅' : '❌');
  console.log('Backend Checkout API:', checkout ? '✅' : '❌');
  console.log('Ngrok Connection:', ngrok ? '✅' : '❌');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Open payhere-backend-test.html in your browser');
  console.log('2. Click "Test Backend APIs" to verify backend is working');
  console.log('3. Click "Test Ngrok APIs" to verify ngrok connection');
  console.log('4. Click "Submit to PayHere" to test the complete flow');
  console.log('5. Check the log in the browser for detailed API responses');
}

runTests();
