// Test with Official PayHere Sandbox Credentials
const crypto = require('crypto');

console.log('🧪 Testing with Official PayHere Sandbox Credentials...\n');

// Official PayHere sandbox credentials (from documentation)
const officialCredentials = {
  merchantId: "1211149",
  merchantSecret: "MzQ0NjUyMzE0OTMxOTk2NzkwMTEyMDM0OTY1MjMxNDkzMTk5Njc5MDE="
};

// Your current credentials
const yourCredentials = {
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

// Generate hash function
function generateHash(credentials, data) {
  const hashString = credentials.merchantId +
    data.orderId +
    data.amount +
    data.currency +
    data.firstName +
    data.lastName +
    data.email +
    data.phone +
    data.address +
    data.city +
    data.country +
    data.items +
    credentials.merchantSecret;
  
  return crypto.createHash('md5').update(hashString, 'utf8').digest('hex').toUpperCase();
}

// Test both credential sets
console.log('1. 🔐 Hash Generation Comparison:');

const officialHash = generateHash(officialCredentials, testData);
const yourHash = generateHash(yourCredentials, testData);

console.log('Official Sandbox Hash:', officialHash);
console.log('Your Credentials Hash:', yourHash);

// Create form data for both
const officialFormData = {
  merchant_id: officialCredentials.merchantId,
  return_url: "http://localhost:8080/api/payments/return",
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
  hash: officialHash
};

const yourFormData = {
  merchant_id: yourCredentials.merchantId,
  return_url: "http://localhost:8080/api/payments/return",
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
  hash: yourHash
};

// Create HTML forms for testing
console.log('\n2. 🧪 Creating Test Forms...');
const fs = require('fs');

// Official sandbox test form
const officialHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Official Sandbox Test</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
        .debug-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 12px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Official Sandbox Test</h2>
        <p>Testing with official PayHere sandbox credentials (should work).</p>
        
        <form id="payhereForm" method="POST" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(officialFormData).map(([key, value]) => `
            <div class="form-group">
                <label>${key}:</label>
                <input type="text" name="${key}" value="${value}" readonly>
            </div>`).join('')}
            
            <button type="submit">Test Official Sandbox</button>
        </form>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="success">✅ Using official PayHere sandbox credentials</span><br>
            <span class="success">✅ Merchant ID: ${officialCredentials.merchantId}</span><br>
            <span class="success">✅ This should work if PayHere is functioning</span><br>
            <br>
            <strong>Test Data:</strong><br>
            Order ID: ${testData.orderId}<br>
            Amount: ${testData.amount} ${testData.currency}<br>
            Hash: ${officialHash}<br>
            <br>
            <strong>Expected Behavior:</strong><br>
            • Should redirect to PayHere sandbox payment page<br>
            • No "Unauthorized payment request" error<br>
        </div>
    </div>
</body>
</html>`;

// Your credentials test form
const yourHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Your Credentials Test</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
        .debug-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 12px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Your Credentials Test</h2>
        <p>Testing with your credentials (currently failing).</p>
        
        <form id="payhereForm" method="POST" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(yourFormData).map(([key, value]) => `
            <div class="form-group">
                <label>${key}:</label>
                <input type="text" name="${key}" value="${value}" readonly>
            </div>`).join('')}
            
            <button type="submit">Test Your Credentials</button>
        </form>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="error">❌ Using your credentials (currently failing)</span><br>
            <span class="error">❌ Merchant ID: ${yourCredentials.merchantId}</span><br>
            <span class="error">❌ This is showing "Unauthorized payment request"</span><br>
            <br>
            <strong>Test Data:</strong><br>
            Order ID: ${testData.orderId}<br>
            Amount: ${testData.amount} ${testData.currency}<br>
            Hash: ${yourHash}<br>
            <br>
            <strong>Expected Behavior:</strong><br>
            • Currently showing "Unauthorized payment request"<br>
            • Indicates account configuration issue<br>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('payhere-official-sandbox-test.html', officialHtml);
fs.writeFileSync('payhere-your-credentials-test.html', yourHtml);

console.log('✅ Created payhere-official-sandbox-test.html (official credentials)');
console.log('✅ Created payhere-your-credentials-test.html (your credentials)');

console.log('\n3. 📋 Test Instructions:');
console.log('1. Open payhere-official-sandbox-test.html');
console.log('   - This uses official PayHere sandbox credentials');
console.log('   - If this works, PayHere is functioning correctly');
console.log('   - If this fails, there\'s a general PayHere issue');
console.log('');
console.log('2. Open payhere-your-credentials-test.html');
console.log('   - This uses your credentials');
console.log('   - Currently showing "Unauthorized payment request"');
console.log('   - Confirms your account needs configuration');
console.log('');
console.log('4. 🎯 Conclusion:');
console.log('If official sandbox works but yours doesn\'t:');
console.log('✅ PayHere is functioning correctly');
console.log('❌ Your account needs configuration by PayHere support');
console.log('');
console.log('If both fail:');
console.log('❌ There might be a general PayHere issue');
console.log('✅ Contact PayHere support for both cases');
