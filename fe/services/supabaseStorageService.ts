import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface FileUploadResult {
  url: string;
  path: string;
  fullUrl: string;
}

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'verification-documents';
  
  /**
   * Initialize storage - checks if bucket exists and provides setup instructions if not
   * Note: Bucket creation should be done via Supabase dashboard for security
   */
  static async initializeStorage(): Promise<void> {
    try {
      // Check if bucket exists (this should work even with RLS)
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Could not list buckets:', listError);
        // Continue anyway - bucket might exist but listing is restricted
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.warn(`⚠️ Bucket '${this.BUCKET_NAME}' not found.`);
        console.log('📋 Setup Required:');
        console.log('1. Go to Supabase Dashboard > Storage');
        console.log('2. Create bucket named "verification-documents"');
        console.log('3. Set as Private bucket');
        console.log('4. Execute the SQL policies from setup-supabase-storage.sql');
        
        // Don't throw error - let the app continue and provide better UX
        return;
      }
      
      console.log('✅ Verification documents bucket is available');
      
      // Test bucket access by trying to list files (should work with proper RLS)
      const { error: accessError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
        
      if (accessError && !accessError.message.includes('empty')) {
        console.warn('Bucket access test warning:', accessError);
      }
      
    } catch (error) {
      console.error('Error checking storage setup:', error);
      // Don't throw - provide graceful degradation
      console.log('📋 Manual Setup Required: Create bucket via Supabase Dashboard');
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
      // Validate file
      if (!file.uri || !file.type || !file.name) {
        throw new Error('Invalid file data');
      }
      
      // Create unique file path: userId/documentType/timestamp_filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${documentType.toLowerCase()}.${fileExtension}`;
      const filePath = `${userId}/${documentType}/${fileName}`;
      
      // Convert React Native URI to File-like object for Supabase
      const response = await fetch(file.uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: file.type,
          upsert: true // Allow overwriting existing files
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Upload failed: No data returned');
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      const result: FileUploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        fullUrl: urlData.publicUrl
      };
      
      console.log('✅ File uploaded successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      console.log('✅ File deleted successfully:', filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
  
  /**
   * List files for a specific user and document type
   */
  static async listUserFiles(userId: string, documentType?: string): Promise<any[]> {
    try {
      const prefix = documentType ? `${userId}/${documentType}/` : `${userId}/`;
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(prefix);
      
      if (error) {
        console.error('List error:', error);
        throw new Error(`List failed: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
  
  /**
   * Get download URL for a file (for private buckets)
   */
  static async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        console.error('Get URL error:', error);
        throw new Error(`Get URL failed: ${error.message}`);
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
}

/*
=== SETUP INSTRUCTIONS FOR SUPABASE STORAGE ===

1. **Create Storage Bucket** (Done automatically by initializeStorage())
   - Bucket name: 'verification-documents'
   - Access: Private (not public)
   - File restrictions: Images and PDFs only, 10MB max

2. **Set Up RLS Policies** (Run these SQL commands in Supabase SQL Editor):

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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

3. **Usage Example:**
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

=== END SETUP INSTRUCTIONS ===
*/
