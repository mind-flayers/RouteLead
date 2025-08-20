// Test PayHere credentials and hash generation
const crypto = require('crypto');

// Test data from your logs
const testData = {
  merchantId: "1231712",
  merchantSecret: "MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5",
  orderId: "RL_1755718565171_19b9d8df",
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

// Expected hash from your logs
const expectedHash = "CA4B3CB4B7CD2CE8BC51AD1FD94D4099";

// Generate hash using the same formula as backend
function generateHash(data) {
  const hashString = data.merchantId +
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
    data.merchantSecret;
  
  console.log('Hash string (without secret):', 
    data.merchantId + data.orderId + data.amount + data.currency + 
    data.firstName + data.lastName + data.email + data.phone + 
    data.address + data.city + data.country + data.items + ' + [SECRET_HIDDEN]');
  
  const hash = crypto.createHash('md5').update(hashString, 'utf8').digest('hex').toUpperCase();
  return hash;
}

// Test hash generation
console.log('🧪 Testing PayHere Hash Generation...');
console.log('Test Data:', JSON.stringify(testData, null, 2));

const generatedHash = generateHash(testData);
console.log('Generated Hash:', generatedHash);
console.log('Expected Hash:', expectedHash);
console.log('Hash Match:', generatedHash === expectedHash);

if (generatedHash === expectedHash) {
  console.log('✅ Hash generation is working correctly!');
} else {
  console.log('❌ Hash generation mismatch!');
  console.log('This could indicate:');
  console.log('1. Different merchant secret');
  console.log('2. Different data values');
  console.log('3. Different hash algorithm');
}

// Test with different data to see if hash changes
console.log('\n🧪 Testing with different order ID...');
const testData2 = { ...testData, orderId: "TEST_1755718565171" };
const generatedHash2 = generateHash(testData2);
console.log('New Order ID Hash:', generatedHash2);
console.log('Hash Changed:', generatedHash2 !== generatedHash);

// Test PayHere sandbox URL
console.log('\n🧪 Testing PayHere URLs...');
const sandboxUrl = "https://sandbox.payhere.lk/pay/checkout";
const liveUrl = "https://www.payhere.lk/pay/checkout";
console.log('Sandbox URL:', sandboxUrl);
console.log('Live URL:', liveUrl);

// Test form data structure
console.log('\n🧪 Testing Form Data Structure...');
const formData = {
  merchant_id: testData.merchantId,
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
  custom_1: "19b9d8df-ae49-4152-935a-66ddbbe11828",
  custom_2: "1693fc40-c4d4-4ae7-b956-1841dba97b25",
  custom_3: "70ba4867-edcb-4628-b614-7bb60e935862",
  custom_4: "CREDIT_CARD",
  hash: generatedHash
};

console.log('Form Data:', JSON.stringify(formData, null, 2));
console.log('Form Data Keys:', Object.keys(formData));
console.log('Required Fields Check:');
console.log('- merchant_id:', !!formData.merchant_id);
console.log('- return_url:', !!formData.return_url);
console.log('- cancel_url:', !!formData.cancel_url);
console.log('- notify_url:', !!formData.notify_url);
console.log('- first_name:', !!formData.first_name);
console.log('- last_name:', !!formData.last_name);
console.log('- email:', !!formData.email);
console.log('- phone:', !!formData.phone);
console.log('- address:', !!formData.address);
console.log('- city:', !!formData.city);
console.log('- country:', !!formData.country);
console.log('- order_id:', !!formData.order_id);
console.log('- items:', !!formData.items);
console.log('- currency:', !!formData.currency);
console.log('- amount:', !!formData.amount);
console.log('- hash:', !!formData.hash);
