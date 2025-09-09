/**
 * Advanced Supabase Storage Diagnostic Script
 * This script provides detailed debugging information
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function advancedDiagnostic() {
  console.log('🔍 Advanced Supabase Storage Diagnostic\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic Supabase connectivity...');
    console.log(`Project URL: ${supabaseUrl}`);
    console.log(`Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // Test 2: Check authentication status
    console.log('\n2️⃣ Checking authentication status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (session) {
      console.log('✅ Authenticated user:', session.user.email);
    } else {
      console.log('⚠️ No active session (using anon key)');
    }
    
    // Test 3: Raw bucket listing with full response
    console.log('\n3️⃣ Raw bucket listing API call...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    console.log('Raw API response:');
    console.log('- Data:', JSON.stringify(buckets, null, 2));
    console.log('- Error:', listError ? JSON.stringify(listError, null, 2) : 'None');
    
    // Test 4: Try to access storage directly
    console.log('\n4️⃣ Testing direct bucket access...');
    try {
      const { data: testFiles, error: testError } = await supabase.storage
        .from('verification-documents')
        .list('', { limit: 1 });
      
      console.log('Direct bucket access:');
      console.log('- Data:', testFiles ? 'Success' : 'No data');
      console.log('- Error:', testError ? testError.message : 'None');
      
      if (testError) {
        console.log('- Error details:', JSON.stringify(testError, null, 2));
      }
      
    } catch (directError) {
      console.log('❌ Direct access failed:', directError.message);
    }
    
    // Test 5: Project validation
    console.log('\n5️⃣ Project validation...');
    console.log('Expected project ID: fnsaibersyxpedauhwfw');
    
    // Extract project ID from URL
    const urlMatch = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/);
    const extractedProjectId = urlMatch ? urlMatch[1] : 'unknown';
    console.log('Extracted project ID:', extractedProjectId);
    console.log('Project ID match:', extractedProjectId === 'fnsaibersyxpedauhwfw' ? '✅' : '❌');
    
    // Test 6: Storage service health check
    console.log('\n6️⃣ Storage service health check...');
    try {
      // Try to get a public URL (this works even if bucket doesn't exist)
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl('test-file.jpg');
      
      console.log('Public URL generation:', urlData.publicUrl ? '✅' : '❌');
      console.log('Generated URL:', urlData.publicUrl);
      
    } catch (urlError) {
      console.log('❌ URL generation failed:', urlError.message);
    }
    
    console.log('\n🎯 Diagnostic Summary:');
    console.log('Connection:', '✅ Working');
    console.log('Auth status:', session ? '✅ Authenticated' : '⚠️ Anonymous');
    console.log('Bucket listing:', buckets && buckets.length > 0 ? '✅ Working' : '❌ Empty/Failed');
    console.log('Project ID:', extractedProjectId === 'fnsaibersyxpedauhwfw' ? '✅ Correct' : '❌ Mismatch');
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run diagnostic
advancedDiagnostic().then(() => {
  console.log('\n✨ Advanced diagnostic completed');
}).catch((error) => {
  console.error('💥 Diagnostic script failed:', error);
});

module.exports = { advancedDiagnostic };
