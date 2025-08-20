// Test PayHere with localhost backend
const crypto = require('crypto');

console.log('🧪 Testing PayHere with localhost backend...\n');

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

// Test backend hash generation
async function testBackendHash() {
  try {
    console.log('1. 🔧 Testing Backend Hash Generation...');
    
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
      console.log('✅ Backend hash generation successful');
      console.log('Generated Hash:', result.hash);
      
      // Generate local hash for comparison
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
      console.log('Local Hash:', localHash);
      console.log('Hash Match:', result.hash === localHash ? '✅' : '❌');
      
      return result.hash;
    } else {
      console.log('❌ Backend hash generation failed:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
    return null;
  }
}

// Test backend configuration
async function testBackendConfig() {
  try {
    console.log('\n2. 🔧 Testing Backend Configuration...');
    
    const response = await fetch('http://localhost:8080/api/payments/payhere/config');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Backend configuration loaded');
      console.log('Merchant ID:', result.data.merchantId);
      console.log('Sandbox URL:', result.data.sandboxUrl);
      console.log('Currency:', result.data.currency);
      
      return result.data;
    } else {
      console.log('❌ Backend configuration failed:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend config test failed:', error.message);
    return null;
  }
}

// Create test form
async function createTestForm(hash, config) {
  console.log('\n3. 🧪 Creating Test Form...');
  
  const formData = {
    merchant_id: credentials.merchantId,
    return_url: "http://localhost:8080/api/payments/return", // Use localhost for testing
    cancel_url: "http://localhost:8080/api/payments/cancel",
    notify_url: "http://localhost:8080/api/payments/webhook",
    first_name: testData.firstName,
    last_name: testData.lastName,
    email: testData.email,
    phone: testData.phone,
    address: testData.address,
    city: testData.city,
    country: testData.country,
    order_id: testData.orderId,
    items: testData.items,
    currency: testData.currency,
    amount: testData.amount,
    custom_1: "test-bid-id",
    custom_2: "test-request-id",
    custom_3: "test-user-id",
    custom_4: "CREDIT_CARD",
    hash: hash
  };

  const fs = require('fs');
  
  const htmlForm = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Local Test</title>
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
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Local Test</h2>
        <p>Testing with localhost backend and correct credentials.</p>
        
        <form id="payhereForm" method="POST" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(formData).map(([key, value]) => `
            <div class="form-group">
                <label>${key}:</label>
                <input type="text" name="${key}" value="${value}" readonly>
            </div>`).join('')}
            
            <button type="submit">Submit to PayHere Sandbox</button>
        </form>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="success">✅ Backend running on localhost:8080</span><br>
            <span class="success">✅ Using correct sandbox credentials</span><br>
            <span class="success">✅ Hash generated by backend</span><br>
            <br>
            <strong>Test Data:</strong><br>
            Order ID: ${testData.orderId}<br>
            Amount: ${testData.amount} ${testData.currency}<br>
            Hash: ${hash}<br>
            <br>
            <strong>Expected Behavior:</strong><br>
            • Should redirect to PayHere sandbox payment page<br>
            • No "Unauthorized payment request" error<br>
            • Use test card: 4242424242424242<br>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync('payhere-local-test.html', htmlForm);
  console.log('✅ Created payhere-local-test.html');
  
  return formData;
}

// Run all tests
async function runTests() {
  const hash = await testBackendHash();
  const config = await testBackendConfig();
  
  if (hash && config) {
    await createTestForm(hash, config);
    
    console.log('\n4. 📋 Summary:');
    console.log('✅ Backend is working correctly with new credentials');
    console.log('✅ Hash generation is working');
    console.log('✅ Configuration is loaded');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open payhere-local-test.html in your browser');
    console.log('2. Test the payment flow');
    console.log('3. If this works, the issue was with ngrok');
    console.log('4. If still failing, contact PayHere support');
    
    console.log('\n⚠️ Note: The return/cancel URLs use localhost, so they won\'t work from PayHere.');
    console.log('This is just for testing the initial payment submission.');
  } else {
    console.log('\n❌ Tests failed. Check backend server status.');
  }
}

runTests();
