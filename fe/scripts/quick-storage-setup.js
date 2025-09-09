/**
 * Supabase Storage Quick Setup Script
 * This script helps verify and guide through storage setup
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const BUCKET_NAME = 'verification-documents';

function safeLog(level, message, error) {
  console[level](message);
  if (error && error.message) {
    console[level]('Details:', error.message);
  }
}

async function quickSetup() {
  console.log('🚀 Supabase Storage Quick Setup\n');
  
  try {
    // Check current status
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      safeLog('error', '❌ Cannot connect to Supabase storage', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log('✅ Great! The verification-documents bucket already exists.');
      
      // Test access
      const { error: accessError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (accessError) {
        console.log('⚠️ Bucket exists but there might be access issues.');
        safeLog('warn', 'Access test details', accessError);
      } else {
        console.log('✅ Bucket is accessible and ready to use!');
      }
      
      console.log('\n🎯 Your setup is complete. You can now:');
      console.log('1. Test the UploadFacePhoto page');
      console.log('2. Upload files without errors');
      
    } else {
      console.log('❌ The verification-documents bucket does not exist yet.\n');
      
      console.log('📋 Quick Setup Instructions:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to Storage section');
      console.log('4. Click "New bucket"');
      console.log('5. Enter name: verification-documents');
      console.log('6. Choose "Public" for easier testing');
      console.log('7. Click "Create bucket"');
      
      console.log('\n🔗 Direct link to your project:');
      console.log('https://supabase.com/dashboard/project/fnsaibersyxpedauhwfw/storage/buckets');
      
      console.log('\n💡 After creating the bucket, run this script again to verify!');
    }
    
  } catch (error) {
    safeLog('error', '💥 Setup check failed', error);
  }
}

// Run setup
quickSetup().then(() => {
  console.log('\n✨ Setup check completed');
}).catch((error) => {
  safeLog('error', '💥 Setup script failed', error);
});

module.exports = { quickSetup };
