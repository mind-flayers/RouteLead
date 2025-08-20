// Debug PayHere Credentials Issue
const crypto = require('crypto');

console.log('🔍 Debugging PayHere Credentials Issue...\n');

// Your current credentials (from logs)
const currentCredentials = {
  merchantId: "1231712",
  merchantSecret: "MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5"
};

// Test data from your actual logs
const testData = {
  orderId: "RL_1755719575877_59a5d122",
  amount: "1000",
  currency: "LKR",
  firstName: "Sanjika ",
  lastName: "Jayasinghe", 
  email: "sanjika560@gmail.com",
  phone: "0719110107",
  address: "RouteLead Delivery",
  city: "Colombo",
  country: "Sri Lanka",
  items: "RouteLead Parcel Delivery Service"
};

// Generate hash with your credentials
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

// Test hash generation
console.log('1. 🔐 Hash Generation Test:');
const generatedHash = generateHash(currentCredentials, testData);
console.log('Generated Hash:', generatedHash);
console.log('Expected Hash (from logs):', '46C85159B392C73F9DA802EEB79B0BC8');
console.log('Hash Match:', generatedHash === '46C85159B392C73F9DA802EEB79B0BC8');

// Create form data
const formData = {
  merchant_id: currentCredentials.merchantId,
  return_url: "https://3f29eef41d7b.ngrok-free.app/api/payments/return",
  cancel_url: "https://3f29eef41d7b.ngrok-free.app/api/payments/cancel",
  notify_url: "https://3f29eef41d7b.ngrok-free.app/api/payments/webhook",
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
  custom_1: "59a5d122-b8fb-4056-921a-bec491cef0af",
  custom_2: "49607dfc-4c34-4ea0-a5a3-338d2511e85f",
  custom_3: "70ba4867-edcb-4628-b614-7bb60e935862",
  custom_4: "CREDIT_CARD",
  hash: generatedHash
};

console.log('\n2. 📋 Form Data Analysis:');
console.log('Merchant ID:', formData.merchant_id);
console.log('Order ID:', formData.order_id);
console.log('Amount:', formData.amount);
console.log('Hash:', formData.hash);

// Check for potential issues
console.log('\n3. 🔍 Potential Issues Analysis:');

// Issue 1: Check if backend is using old credentials
console.log('Issue 1: Backend Credentials Mismatch');
console.log('From logs, backend returned hash: 46C85159B392C73F9DA802EEB79B0BC8');
console.log('Local hash with current credentials:', generatedHash);
console.log('Status:', generatedHash === '46C85159B392C73F9DA802EEB79B0BC8' ? '✅ Match' : '❌ Mismatch');

if (generatedHash !== '46C85159B392C73F9DA802EEB79B0BC8') {
  console.log('⚠️ Backend is using different credentials than expected!');
  console.log('This means the backend server needs to be restarted.');
}

// Issue 2: Check field formatting
console.log('\nIssue 2: Field Formatting');
console.log('First name has trailing space:', `"${testData.firstName}"`);
console.log('Amount format:', typeof testData.amount, testData.amount);
console.log('Phone format:', testData.phone);

// Issue 3: Check for special characters
console.log('\nIssue 3: Special Characters');
const hashString = currentCredentials.merchantId +
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
  currentCredentials.merchantSecret;

console.log('Hash string length:', hashString.length);
console.log('First name in hash:', `"${testData.firstName}"`);
console.log('Last name in hash:', `"${testData.lastName}"`);

// Create a test with cleaned data
console.log('\n4. 🧪 Test with Cleaned Data:');
const cleanedData = {
  ...testData,
  firstName: testData.firstName.trim(), // Remove trailing space
  amount: testData.amount.toString() // Ensure string format
};

const cleanedHash = generateHash(currentCredentials, cleanedData);
console.log('Cleaned hash:', cleanedHash);
console.log('Original hash:', generatedHash);
console.log('Hash difference:', cleanedHash !== generatedHash ? '⚠️ Different' : '✅ Same');

// Create HTML form for direct testing
console.log('\n5. 🧪 Creating Direct Test Form...');
const fs = require('fs');

const htmlForm = `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Direct Test</title>
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
        .error { color: #dc3545; }
        .success { color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PayHere Direct Test</h2>
        <p>Testing with exact data from your logs to isolate the issue.</p>
        
        <form id="payhereForm" method="POST" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(formData).map(([key, value]) => `
            <div class="form-group">
                <label>${key}:</label>
                <input type="text" name="${key}" value="${value}" readonly>
            </div>`).join('')}
            
            <button type="submit">Submit to PayHere</button>
        </form>
        
        <div class="debug-info">
            <strong>Debug Information:</strong><br>
            <span class="error">⚠️ Testing with exact data from your logs</span><br>
            <span class="error">⚠️ If this still fails, the issue is with credentials or PayHere configuration</span><br>
            <br>
            <strong>Data Analysis:</strong><br>
            Merchant ID: ${formData.merchant_id}<br>
            Order ID: ${formData.order_id}<br>
            Amount: ${formData.amount}<br>
            Hash: ${formData.hash}<br>
            <br>
            <strong>Expected Behavior:</strong><br>
            • If credentials are correct: Should redirect to payment page<br>
            • If credentials are wrong: Will show "Unauthorized payment request"<br>
            <br>
            <strong>Next Steps:</strong><br>
            • If this fails: Restart backend server to load new credentials<br>
            • If this works: Issue is in the app's form submission<br>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('payhere-direct-test.html', htmlForm);
console.log('✅ Created payhere-direct-test.html');

// Test backend configuration
console.log('\n6. 🔧 Testing Backend Configuration...');
async function testBackendConfig() {
  try {
    const response = await fetch('https://3f29eef41d7b.ngrok-free.app/api/payments/payhere/config');
    const result = await response.json();
    
    console.log('Backend Config Response:');
    console.log('Merchant ID:', result.merchantId);
    console.log('Expected Merchant ID:', currentCredentials.merchantId);
    console.log('Match:', result.merchantId === currentCredentials.merchantId ? '✅' : '❌');
    
    if (result.merchantId !== currentCredentials.merchantId) {
      console.log('⚠️ Backend is using old credentials! Server needs restart.');
    }
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
  }
}

testBackendConfig().then(() => {
  console.log('\n7. 📋 Summary:');
  console.log('The "Unauthorized payment request" error is likely due to:');
  console.log('1. Backend server not restarted (most likely)');
  console.log('2. Credentials mismatch between frontend and backend');
  console.log('3. PayHere account configuration issue');
  
  console.log('\n🎯 Immediate Action Required:');
  console.log('1. Restart your backend server');
  console.log('2. Test with payhere-direct-test.html');
  console.log('3. If still failing, contact PayHere support');
});
