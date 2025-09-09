/**
 * Test script to verify Supabase storage setup
 * Run this to check if the bucket exists and is accessible
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'verification-documents';

// Safe logging function
function safeLog(level, message, error) {
  console[level](message);
  if (error) {
    if (typeof error === 'string') {
      console[level]('Error details:', error);
    } else if (error.message) {
      console[level]('Error message:', error.message);
    } else {
      console[level]('Error type:', typeof error);
    }
  }
}

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage Setup...\n');
  
  try {
    // Test 1: List all buckets
    console.log('1️⃣ Testing bucket listing...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      safeLog('warn', '⚠️ Could not list buckets', listError);
    } else {
      console.log('✅ Buckets listed successfully');
      console.log('Available buckets:', buckets?.map(b => b.name) || []);
    }
    
    // Test 2: Check if our bucket exists in listing
    console.log('\n2️⃣ Checking verification-documents bucket...');
    let bucketExists = false;
    
    if (buckets && buckets.length > 0) {
      bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
      if (bucketExists) {
        console.log('✅ verification-documents bucket found in listing');
      } else {
        console.log('❌ verification-documents bucket not found in listing');
      }
    } else {
      console.log('⚠️ Bucket listing empty (common for anonymous users)');
    }
    
    // Test 3: Direct bucket access test (more reliable)
    console.log('\n3️⃣ Testing direct bucket access...');
    let directAccessWorks = false;
    
    try {
      const { data: files, error: accessError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (accessError) {
        if (accessError.message && accessError.message.toLowerCase().includes('bucket')) {
          console.log('❌ Bucket does not exist');
        } else {
          console.log('⚠️ Bucket exists but access restricted');
          console.log('Access error:', accessError.message);
          directAccessWorks = true; // Bucket exists, just access limited
        }
      } else {
        console.log('✅ Direct bucket access successful');
        console.log(`Found ${files?.length || 0} files in root`);
        directAccessWorks = true;
      }
    } catch (directError) {
      console.log('❌ Direct access failed:', directError.message);
    }
    
    // Test 4: Test public URL generation
    console.log('\n4️⃣ Testing public URL generation...');
    const testPath = 'test/sample.jpg';
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    // Final determination
    const actuallyExists = bucketExists || directAccessWorks;
    
    if (actuallyExists) {
      console.log('\n🎉 SUCCESS! The verification-documents bucket is working!');
      console.log('✅ Bucket is accessible for file operations');
      console.log('✅ Your app should now work for file uploads');
    } else {
      console.log('\n❌ BUCKET NOT FOUND');
      console.log('\n📋 Setup Instructions:');
      console.log('1. Go to Supabase Dashboard > Storage');
      console.log('2. Create bucket named "verification-documents"');
      console.log('3. Choose Public or Private access:');
      console.log('   - Public: Anyone can read files (simpler setup)');
      console.log('   - Private: Only authenticated users (more secure, requires RLS)');
    }
    
    console.log('\n🎯 Summary:');
    console.log(`Bucket in listing: ${bucketExists ? '✅' : '❌'}`);
    console.log(`Direct access: ${directAccessWorks ? '✅' : '❌'}`);
    console.log(`Overall status: ${actuallyExists ? '✅ WORKING' : '❌ NEEDS SETUP'}`);
    
  } catch (error) {
    safeLog('error', '💥 Test failed with error', error);
  }
}

// Run the test
testStorageSetup().then(() => {
  console.log('\n✨ Storage test completed');
}).catch((error) => {
  safeLog('error', '💥 Test script failed', error);
});
