// Test script for verification system components
// Run this in React Native debugger or add to a test component

import { SupabaseStorageService } from './supabaseStorageService';
import { VerificationFlowService } from './verificationFlowService';
import { supabase } from '../lib/supabase';

export class VerificationSystemTest {
  
  // Test 1: Check Supabase connection
  static async testSupabaseConnection() {
    console.log('🧪 Testing Supabase connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
      }
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }

  // Test 2: Initialize storage bucket
  static async testStorageInitialization() {
    console.log('🧪 Testing storage initialization...');
    try {
      await SupabaseStorageService.initializeStorage();
      console.log('✅ Storage initialization successful');
      return true;
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      return false;
    }
  }

  // Test 3: Check backend connection
  static async testBackendConnection() {
    console.log('🧪 Testing backend connection...');
    try {
      const response = await fetch('http://localhost:8080/api/verification/test/status-with-docs');
      if (response.ok || response.status === 400) {
        // 400 is expected for authentication/not found, but means server is responding
        console.log('✅ Backend connection successful (status:', response.status, ')');
        return true;
      } else {
        console.error('❌ Backend connection failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }

  // Test 4: Test verification flow service initialization
  static async testVerificationFlow() {
    console.log('🧪 Testing verification flow service...');
    try {
      const mockUserId = 'test-user-123';
      const flowService = VerificationFlowService.getInstance();
      await flowService.initializeFlow(mockUserId);
      console.log('✅ Verification flow service initialization successful');
      return true;
    } catch (error) {
      console.error('❌ Verification flow service failed:', error);
      return false;
    }
  }

  // Test 5: Check storage bucket exists
  static async testStorageBucket() {
    console.log('🧪 Testing storage bucket...');
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('❌ Error listing buckets:', error);
        return false;
      }
      
      const verificationBucket = buckets?.find(bucket => bucket.name === 'verification-documents');
      if (verificationBucket) {
        console.log('✅ Verification documents bucket exists');
        return true;
      } else {
        console.log('⚠️ Verification documents bucket not found - needs setup');
        return false;
      }
    } catch (error) {
      console.error('❌ Storage bucket test failed:', error);
      return false;
    }
  }

  // Run all tests
  static async runAllTests() {
    console.log('🚀 Starting verification system tests...\n');
    
    const results = {
      supabaseConnection: await this.testSupabaseConnection(),
      storageInitialization: await this.testStorageInitialization(),
      backendConnection: await this.testBackendConnection(),
      verificationFlow: await this.testVerificationFlow(),
      storageBucket: await this.testStorageBucket()
    };

    console.log('\n📊 Test Results:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (!results.storageBucket) {
      console.log('\n📋 Action Required:');
      console.log('1. Execute the SQL setup in Supabase dashboard');
      console.log('2. File location: fe/scripts/setup-supabase-storage.sql');
      console.log('3. Follow the VERIFICATION_SETUP_GUIDE.md instructions');
    }

    return allPassed;
  }
}

// Usage example for testing in a React component:
/*
useEffect(() => {
  VerificationSystemTest.runAllTests();
}, []);
*/
