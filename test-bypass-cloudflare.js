// Test PayHere without Cloudflare interference
const crypto = require('crypto');

console.log('🧪 Testing PayHere without Cloudflare interference...\n');

// Your credentials
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

// Generate hash
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

const hash = crypto.createHash('md5').update(hashString, 'utf8').digest('hex').toUpperCase();

console.log('🔐 Generated Hash:', hash);

// Create form data with direct server URLs (bypassing Cloudflare)
const formData = {
  merchant_id: credentials.merchantId,
  return_url: "http://localhost:8080/api/payments/return", // Direct localhost
  cancel_url: "http://localhost:8080/api/payments/cancel", // Direct localhost
  notify_url: "http://localhost:8080/api/payments/webhook", // Direct localhost
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

// Create HTML form
const fs = require('fs');

const htmlForm = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Test - Bypass Cloudflare</title>
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
        .warning { color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Test - Bypass Cloudflare</h2>
        <p>Testing with direct localhost URLs to bypass Cloudflare interference.</p>
        
        <form id="payhereForm" method="POST" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(formData).map(([key, value]) => `
            <div class="form-group">
                <label>${key}:</label>
                <input type="text" name="${key}" value="${value}" readonly>
            </div>`).join('')}
            
            <button type="submit">Test Without Cloudflare</button>
        </form>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="warning">⚠️ Using localhost URLs to bypass Cloudflare</span><br>
            <span class="success">✅ Return URL: http://localhost:8080/api/payments/return</span><br>
            <span class="success">✅ Cancel URL: http://localhost:8080/api/payments/cancel</span><br>
            <span class="success">✅ Notify URL: http://localhost:8080/api/payments/webhook</span><br>
            <br>
            <strong>Test Data:</strong><br>
            Order ID: ${testData.orderId}<br>
            Amount: ${testData.amount} ${testData.currency}<br>
            Hash: ${hash}<br>
            <br>
            <strong>Expected Behavior:</strong><br>
            • Should redirect to PayHere sandbox payment page<br>
            • No "Unauthorized payment request" error<br>
            • Return/cancel URLs will work locally<br>
            <br>
            <strong>If this works:</strong><br>
            • Cloudflare was the issue<br>
            • Need to configure Cloudflare for PayHere<br>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('payhere-bypass-cloudflare.html', htmlForm);
console.log('✅ Created payhere-bypass-cloudflare.html');

console.log('\n📋 Test Instructions:');
console.log('1. Open payhere-bypass-cloudflare.html');
console.log('2. Test the payment flow');
console.log('3. If this works, Cloudflare was the issue');
console.log('');
console.log('🔧 Cloudflare Solutions:');
console.log('1. Create subdomain: payhere.yourdomain.com (no Cloudflare proxy)');
console.log('2. Configure Cloudflare Page Rules for /api/payments/*');
console.log('3. Use direct server IP instead of Cloudflare domain');
