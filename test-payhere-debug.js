// Test script to debug PayHere hash generation
const testData = {
  "merchant_id": "1231712",
  "return_url": "https://3f29eef41d7b.ngrok-free.app/api/payments/return",
  "cancel_url": "https://3f29eef41d7b.ngrok-free.app/api/payments/cancel",
  "notify_url": "https://3f29eef41d7b.ngrok-free.app/api/payments/webhook",
  "first_name": "Sanjika ",
  "last_name": "Jayasinghe",
  "email": "sanjika560@gmail.com",
  "phone": "0719110107",
  "address": "RouteLead Delivery",
  "city": "Colombo",
  "country": "Sri Lanka",
  "order_id": "RL_1755718565171_19b9d8df",
  "items": "RouteLead Parcel Delivery Service",
  "currency": "LKR",
  "amount": "1000",
  "custom_1": "19b9d8df-ae49-4152-935a-66ddbbe11828",
  "custom_2": "1693fc40-c4d4-4ae7-b956-1841dba97b25",
  "custom_3": "70ba4867-edcb-4628-b614-7bb60e935862",
  "custom_4": "CREDIT_CARD",
  "hash": "CA4B3CB4B7CD2CE8BC51AD1FD94D4099"
};

// Test the debug endpoint
async function testDebugHash() {
  try {
    const response = await fetch('https://3f29eef41d7b.ngrok-free.app/api/payments/payhere/debug-hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: testData.order_id,
        amount: testData.amount,
        currency: testData.currency,
        first_name: testData.first_name,
        last_name: testData.last_name,
        email: testData.email,
        phone: testData.phone,
        address: testData.address,
        city: testData.city,
        country: testData.country,
        items: testData.items
      })
    });

    const result = await response.json();
    console.log('Debug Hash Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Hash generated successfully');
      console.log('Generated Hash:', result.hash);
      console.log('Expected Hash:', testData.hash);
      console.log('Hash Match:', result.hash === testData.hash);
    } else {
      console.log('❌ Hash generation failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error testing debug hash:', error);
  }
}

// Test the PayHere configuration
async function testPayHereConfig() {
  try {
    const response = await fetch('https://3f29eef41d7b.ngrok-free.app/api/payments/payhere/config');
    const result = await response.json();
    console.log('PayHere Config:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error testing PayHere config:', error);
  }
}

// Run tests
console.log('🧪 Testing PayHere Debug Hash Generation...');
testDebugHash().then(() => {
  console.log('\n🧪 Testing PayHere Configuration...');
  return testPayHereConfig();
}).then(() => {
  console.log('\n✅ All tests completed');
});
