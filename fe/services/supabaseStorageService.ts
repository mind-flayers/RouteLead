import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface FileUploadResult {
  url: string;
  path: string;
  fullUrl: string;
}

// Safe error logging to avoid circular reference issues
function safeLog(level: 'log' | 'warn' | 'error', message: string, error?: any) {
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

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'verification-documents';
  private static bucketStatus: 'unknown' | 'exists' | 'missing' = 'unknown';
  
  /**
   * Initialize storage - checks if bucket exists and provides setup instructions if not
   * Note: Bucket creation should be done via Supabase dashboard for security
   */
  static async initializeStorage(): Promise<void> {
    try {
      safeLog('log', '🔍 Checking Supabase storage setup...');
      
      // Check if bucket exists (this should work even with RLS)
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        safeLog('warn', 'Could not list buckets', listError);
        // Continue anyway - bucket might exist but listing is restricted
        this.bucketStatus = 'unknown';
      } else {
        const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
        
        if (bucketExists) {
          this.bucketStatus = 'exists';
          safeLog('log', '✅ Verification documents bucket found in listing');
        } else if (buckets && buckets.length === 0) {
          // Empty bucket list - common for anonymous users, test direct access
          safeLog('log', '⚠️ Bucket listing empty (anonymous access), testing direct access...');
        } else {
          this.bucketStatus = 'missing';
          safeLog('warn', `⚠️ Bucket '${this.BUCKET_NAME}' not found in listing.`);
        }
      }
      
      // If bucket listing failed or returned empty, test direct bucket access
      if (this.bucketStatus !== 'exists') {
        safeLog('log', '🧪 Testing direct bucket access...');
        const { error: accessError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list('', { limit: 1 });
          
        if (accessError) {
          // Check if it's a "bucket not found" error specifically
          if (accessError.message && accessError.message.toLowerCase().includes('bucket')) {
            this.bucketStatus = 'missing';
            safeLog('warn', `⚠️ Bucket '${this.BUCKET_NAME}' not found.`);
            console.log('📋 Setup Required:');
            console.log('1. Go to Supabase Dashboard > Storage');
            console.log('2. Create bucket named "verification-documents"');
            console.log('3. Set bucket access (Public or Private with RLS)');
            console.log('4. If using Private bucket, execute SQL policies from setup-supabase-storage.sql');
          } else {
            // Other access error, but bucket might exist
            this.bucketStatus = 'unknown';
            safeLog('warn', 'Bucket access test warning', accessError);
          }
        } else {
          // Direct access works - bucket exists!
          this.bucketStatus = 'exists';
          safeLog('log', '✅ Verification documents bucket accessible (confirmed via direct access)');
        }
      }
      
      // Final status check
      if (this.bucketStatus === 'exists') {
        safeLog('log', '✅ Storage setup completed successfully');
      }
      
    } catch (error) {
      safeLog('error', 'Error checking storage setup', error);
      this.bucketStatus = 'unknown';
      // Don't throw - provide graceful degradation
      console.log('📋 Manual Setup Required: Create bucket via Supabase Dashboard');
    }
  }
  
  /**
   * Check if storage is available for uploads
   */
  static isStorageAvailable(): boolean {
    return this.bucketStatus === 'exists';
  }
  
  /**
   * Get storage status message
   */
  static getStorageStatusMessage(): string {
    switch (this.bucketStatus) {
      case 'exists':
        return '✅ Storage ready for uploads';
      case 'missing':
        return '⚠️ Storage bucket not created yet. Please create the verification-documents bucket in Supabase Dashboard.';
      case 'unknown':
        return '⚠️ Storage status unknown. Please check Supabase connection.';
      default:
        return '⚠️ Storage not initialized.';
    }
  }
  
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: {
      uri: string;
      type: string;
      name: string;
    },
    userId: string,
    documentType: string
  ): Promise<FileUploadResult> {
    try {
      safeLog('log', `📤 Starting upload for ${documentType}...`);
      
      // Check if storage is available
      if (this.bucketStatus === 'missing') {
        throw new Error('Storage bucket not available. Please create the verification-documents bucket in Supabase Dashboard first.');
      }
      
      // Validate file
      if (!file.uri || !file.type || !file.name) {
        throw new Error('Invalid file data');
      }
      
      // Create unique file path: documents/userId/documentType/timestamp_filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${documentType.toLowerCase()}.${fileExtension}`;
      const filePath = `documents/${userId}/${documentType}/${fileName}`;
      
      safeLog('log', `📁 Upload path: ${filePath}`);
      safeLog('log', `📱 Source file URI: ${file.uri}`);
      safeLog('log', `📄 File type: ${file.type}`);
      safeLog('log', `📝 File name: ${file.name}`);
      
      // Convert React Native URI to File-like object for Supabase
      safeLog('log', '🔄 Converting file URI to blob...');
      
      let response;
      let blob;
      
      try {
        response = await fetch(file.uri);
        safeLog('log', `📡 Fetch response status: ${response.status}`);
        safeLog('log', `📡 Fetch response ok: ${response.ok}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        
        blob = await response.blob();
        safeLog('log', `📦 File prepared, size: ${blob.size} bytes, type: ${blob.type}`);
        
      } catch (fetchError) {
        safeLog('error', '❌ Failed to fetch file from URI', fetchError);
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        throw new Error(`Failed to read file from URI: ${errorMessage}`);
      }
      
      // Upload to Supabase Storage
      safeLog('log', '☁️ Starting Supabase upload...');
      safeLog('log', `📦 Uploading to bucket: ${this.BUCKET_NAME}`);
      safeLog('log', `📁 File path: ${filePath}`);
      safeLog('log', `📊 Blob size: ${blob.size} bytes`);
      safeLog('log', `📄 Content type: ${file.type}`);
      safeLog('log', `🔧 Platform: React Native (Expo)`);
      
      try {
        // Try the upload with additional debugging
        safeLog('log', '⚡ Attempting Supabase storage upload...');
        
        // For React Native, skip the direct blob upload and use FormData approach immediately
        safeLog('log', '🔄 Using FormData approach for React Native compatibility...');
        return await this.uploadFileViaFormData(file, userId, documentType, filePath);
        
      } catch (uploadError) {
        safeLog('error', '❌ Upload operation failed', uploadError);
        
        // Provide more specific error messaging
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
        
        if (errorMessage.includes('Network request failed')) {
          // This is likely a React Native specific connectivity issue
          safeLog('error', '🌐 React Native network connectivity issue detected');
          safeLog('log', '🔄 Trying alternative upload method...');
          
          try {
            return await this.uploadFileViaFormData(file, userId, documentType, filePath);
          } catch (fallbackError) {
            safeLog('error', '❌ Fallback upload also failed', fallbackError);
            safeLog('log', '💡 Troubleshooting steps:');
            safeLog('log', '   1. Try on a different network (mobile data vs WiFi)');
            safeLog('log', '   2. Check if this works in a production build vs development');
            safeLog('log', '   3. Verify no VPN or proxy is interfering');
            safeLog('log', '   4. Test on a physical device vs emulator');
            
            throw new Error('Network error: Upload failed due to React Native networking limitations. Please try on a different network or in a production build.');
          }
        } else {
          throw uploadError;
        }
      }
      
      // Get public URL for the uploaded file
      safeLog('log', '🔗 Generating public URL...');
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      const result: FileUploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        fullUrl: urlData.publicUrl
      };
      
      safeLog('log', `✅ File uploaded successfully to: ${result.url}`);
      return result;
      
    } catch (error) {
      safeLog('error', 'Error uploading file', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      safeLog('log', `🗑️ Deleting file: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        safeLog('error', 'Delete error', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      safeLog('log', '✅ File deleted successfully');
    } catch (error) {
      safeLog('error', 'Error deleting file', error);
      throw error;
    }
  }
  
  /**
   * List files for a specific user and document type
   */
  static async listUserFiles(userId: string, documentType?: string): Promise<any[]> {
    try {
      const prefix = documentType ? `${userId}/${documentType}/` : `${userId}/`;
      safeLog('log', `📋 Listing files with prefix: ${prefix}`);
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(prefix);
      
      if (error) {
        safeLog('error', 'List error', error);
        throw new Error(`List failed: ${error.message}`);
      }
      
      safeLog('log', `✅ Found ${data?.length || 0} files`);
      return data || [];
    } catch (error) {
      safeLog('error', 'Error listing files', error);
      throw error;
    }
  }
  
  /**
   * Get download URL for a file (for private buckets)
   */
  static async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      safeLog('log', `🔗 Getting download URL for: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        safeLog('error', 'Get URL error', error);
        throw new Error(`Get URL failed: ${error.message}`);
      }
      
      safeLog('log', '✅ Download URL generated successfully');
      return data.signedUrl;
    } catch (error) {
      safeLog('error', 'Error getting download URL', error);
      throw error;
    }
  }
  
  /**
   * Alternative upload method using FormData (for React Native compatibility)
   */
  static async uploadFileViaFormData(
    file: {
      uri: string;
      type: string;
      name: string;
    },
    userId: string,
    documentType: string,
    filePath: string
  ): Promise<FileUploadResult> {
    try {
      safeLog('log', '📋 Attempting FormData upload method...');
      
      // Create FormData for the upload
      const formData = new FormData();
      
      // For React Native, use the direct file URI approach
      // This avoids blob compatibility issues
      safeLog('log', '� Using React Native file object format for FormData...');
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
      
      safeLog('log', '📦 FormData prepared with RN file object');
      
      // Get the Supabase storage URL directly
      const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${this.BUCKET_NAME}/${filePath}`;
      
      safeLog('log', `🎯 Upload URL: ${uploadUrl}`);
      
      // Make direct HTTP request to Supabase storage API
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ`,
          // Don't set Content-Type for FormData - let the browser set it with boundary
        },
        body: formData,
      });
      
      safeLog('log', `📡 Direct upload response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        safeLog('error', `❌ Direct upload failed: ${response.status} ${response.statusText}`);
        safeLog('error', `❌ Response body: ${errorText}`);
        throw new Error(`Direct upload failed: ${response.status} ${response.statusText}`);
      }
      
      safeLog('log', '✅ Direct upload successful!');
      
      // Generate public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      const result: FileUploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        fullUrl: urlData.publicUrl
      };
      
      safeLog('log', `✅ FormData upload completed: ${result.url}`);
      return result;
      
    } catch (error) {
      safeLog('error', '❌ FormData upload failed', error);
      throw error;
    }
  }
}

/*
=== SUPABASE STORAGE SETUP INSTRUCTIONS ===

🚨 CURRENT STATUS: Bucket 'verification-documents' does not exist yet!

📋 REQUIRED SETUP STEPS:

1. **Create Storage Bucket** (MANUAL STEP - REQUIRED!)
   - Go to: https://supabase.com/dashboard/project/fnsaibersyxpedauhwfw/storage/buckets
   - Click "New bucket"
   - Bucket name: 'verification-documents'
   - Access: Choose "Public" (recommended for testing) or "Private" (more secure)

2. **Test Setup**
   - Run: `node scripts/test-storage-setup.js`
   - Should show: ✅ verification-documents bucket found

3. **For Private Bucket Only** (Run these SQL commands in Supabase SQL Editor):

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload their own documents
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to view their own documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to update their own documents
CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to delete their own documents
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

4. **Usage Example**:
```typescript
// Initialize storage (call once during app startup)
await SupabaseStorageService.initializeStorage();

// Upload a file
const result = await SupabaseStorageService.uploadFile(
  { uri: 'file://...', type: 'image/jpeg', name: 'photo.jpg' },
  userId,
  'FACE_PHOTO'
);

// Result contains: { url, path, fullUrl }
console.log('File uploaded to:', result.url);
```

🔧 TROUBLESHOOTING:
- JSON Parser Error: Fixed with safe logging
- Bucket not found: Create bucket in Supabase Dashboard
- Upload fails: Check bucket permissions and file size

📖 Full guide: docs/SUPABASE_STORAGE_SETUP_GUIDE.md

=== END SETUP INSTRUCTIONS ===
*/
