// Simple test script to check API connection
const { testApiConnection } = require('./services/apiService');

async function runTest() {
  console.log('Testing API connection...');
  try {
    const result = await testApiConnection();
    console.log('API test result:', result);
  } catch (error) {
    console.error('Error running API test:', error);
  }
}

runTest();
