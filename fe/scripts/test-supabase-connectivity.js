#!/usr/bin/env node

// Test network connectivity to Supabase
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnectivity() {
  console.log('🌐 Testing Supabase Connectivity...\n');
  
  const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ';
  
  // Test 1: Basic HTTP connectivity
  console.log('1️⃣ Testing basic HTTP connectivity...');
  try {
    const response = await fetch(supabaseUrl);
    console.log('✅ HTTP connectivity:', response.status, response.statusText);
  } catch (error) {
    console.log('❌ HTTP connectivity failed:', error.message);
    return false;
  }
  
  // Test 2: Supabase client initialization
  console.log('\n2️⃣ Testing Supabase client...');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    // Test 3: Simple API call
    console.log('\n3️⃣ Testing storage API...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('⚠️ Storage API error:', error.message);
      // This might be expected due to permissions
    } else {
      console.log('✅ Storage API accessible');
      console.log('Buckets:', buckets?.map(b => b.name) || []);
    }
    
    // Test 4: Direct bucket access
    console.log('\n4️⃣ Testing bucket access...');
    const { data: files, error: accessError } = await supabase.storage
      .from('verification-documents')
      .list('', { limit: 1 });
    
    if (accessError) {
      if (accessError.message.includes('Network request failed')) {
        console.log('❌ Network request failed - this is the same error as in the app!');
        console.log('💡 This suggests a network connectivity issue to Supabase storage API');
        return false;
      } else {
        console.log('⚠️ Access error (might be permissions):', accessError.message);
      }
    } else {
      console.log('✅ Bucket access successful');
    }
    
    // Test 5: Upload test with image file (same type as app)
    console.log('\n5️⃣ Testing upload with image file...');
    
    // Create a simple 1x1 pixel JPEG in base64
    const jpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
    
    // Convert base64 to blob
    const binaryString = atob(jpegBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
    
    console.log(`📷 Created test image: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload('test/connectivity-test.jpg', imageBlob, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      if (uploadError.message.includes('Network request failed')) {
        console.log('💥 FOUND THE ISSUE: Network request failed during upload');
        console.log('🔍 This is exactly the same error as in your app');
        return false;
      }
    } else {
      console.log('✅ Upload test successful!');
      console.log('📁 Uploaded to:', uploadData.path);
    }
    
  } catch (error) {
    console.log('❌ Supabase test failed:', error.message);
    return false;
  }
  
  return true;
}

async function main() {
  const success = await testSupabaseConnectivity();
  
  console.log('\n🎯 Connectivity Test Results:');
  if (success) {
    console.log('✅ All connectivity tests passed!');
    console.log('💡 The upload issue might be app-specific or temporary');
  } else {
    console.log('❌ Network connectivity issues detected');
    console.log('💡 Possible solutions:');
    console.log('   • Check internet connection');
    console.log('   • Check if Supabase service is down');
    console.log('   • Try using a VPN if there are regional restrictions');
    console.log('   • Check firewall/proxy settings');
  }
}

main().catch(console.error);
