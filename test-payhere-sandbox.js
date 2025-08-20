// Test with official PayHere sandbox credentials
const crypto = require('crypto');

// Official PayHere sandbox credentials (from documentation)
const sandboxCredentials = {
  merchantId: "1211149", // Official sandbox merchant ID
  merchantSecret: "MzQ0NjUyMzE0OTMxOTk2NzkwMTEyMDM0OTY1MjMxNDkzMTk5Njc5MDE=", // Official sandbox secret
};

// Your current credentials
const currentCredentials = {
  merchantId: "1231712",
  merchantSecret: "MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5",
};

// Test data
const testData = {
  orderId: "TEST_1755718565171",
  amount: "1000",
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
  
  const hash = crypto.createHash('md5').update(hashString, 'utf8').digest('hex').toUpperCase();
  return hash;
}

// Test both credential sets
console.log('🧪 Testing PayHere Sandbox Credentials...\n');

console.log('1. Testing Official Sandbox Credentials:');
console.log('Merchant ID:', sandboxCredentials.merchantId);
console.log('Merchant Secret Length:', sandboxCredentials.merchantSecret.length);
const sandboxHash = generateHash(sandboxCredentials, testData);
console.log('Generated Hash:', sandboxHash);

console.log('\n2. Testing Your Current Credentials:');
console.log('Merchant ID:', currentCredentials.merchantId);
console.log('Merchant Secret Length:', currentCredentials.merchantSecret.length);
const currentHash = generateHash(currentCredentials, testData);
console.log('Generated Hash:', currentHash);

// Create form data for both
const sandboxFormData = {
  merchant_id: sandboxCredentials.merchantId,
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
  custom_1: "test-bid-id",
  custom_2: "test-request-id",
  custom_3: "test-user-id",
  custom_4: "CREDIT_CARD",
  hash: sandboxHash
};

const currentFormData = {
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
  custom_1: "test-bid-id",
  custom_2: "test-request-id",
  custom_3: "test-user-id",
  custom_4: "CREDIT_CARD",
  hash: currentHash
};

console.log('\n3. Form Data Comparison:');
console.log('Sandbox Form Data (first few fields):', {
  merchant_id: sandboxFormData.merchant_id,
  order_id: sandboxFormData.order_id,
  amount: sandboxFormData.amount,
  hash: sandboxFormData.hash
});

console.log('Current Form Data (first few fields):', {
  merchant_id: currentFormData.merchant_id,
  order_id: currentFormData.order_id,
  amount: currentFormData.amount,
  hash: currentFormData.hash
});

// Test URLs
console.log('\n4. PayHere URLs:');
console.log('Sandbox URL:', 'https://sandbox.payhere.lk/pay/checkout');
console.log('Live URL:', 'https://www.payhere.lk/pay/checkout');

// Recommendations
console.log('\n5. Recommendations:');
console.log('✅ If you\'re using sandbox environment, try the official sandbox credentials');
console.log('✅ If you\'re using live environment, use your live credentials');
console.log('✅ Make sure the environment setting matches your credentials');
console.log('✅ Verify that your merchant account is properly configured');

// Create HTML forms for testing
console.log('\n6. Creating test HTML forms...');

const fs = require('fs');

// Sandbox test form
const sandboxHtml = `
<!DOCTYPE html>
<html>
<head><title>PayHere Sandbox Test</title></head>
<body>
<h2>PayHere Sandbox Test (Official Credentials)</h2>
<form method="POST" action="https://sandbox.payhere.lk/pay/checkout">
${Object.entries(sandboxFormData).map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`).join('\n')}
<input type="submit" value="Test Sandbox Payment">
</form>
</body>
</html>`;

// Current test form
const currentHtml = `
<!DOCTYPE html>
<html>
<head><title>PayHere Current Test</title></head>
<body>
<h2>PayHere Current Test (Your Credentials)</h2>
<form method="POST" action="https://sandbox.payhere.lk/pay/checkout">
${Object.entries(currentFormData).map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`).join('\n')}
<input type="submit" value="Test Current Payment">
</form>
</body>
</html>`;

fs.writeFileSync('test-payhere-sandbox.html', sandboxHtml);
fs.writeFileSync('test-payhere-current.html', currentHtml);

console.log('✅ Created test-payhere-sandbox.html (official sandbox credentials)');
console.log('✅ Created test-payhere-current.html (your current credentials)');
console.log('\nOpen these files in your browser to test both credential sets!');
