# 🚀 Supabase Storage Setup Guide

## 🚨 Current Issue Resolution

**Problem**: UploadFacePhoto page throws errors:
- `⚠️ Bucket 'verification-documents' not found`
- `ERROR Maximum nesting level in JSON parser exceeded`

**Root Cause**: 
1. Supabase storage bucket doesn't exist yet
2. JSON circular reference error when logging Supabase objects

**Status**: ✅ FIXED - Safe logging implemented, bucket creation needed

---

## ✅ What I've Fixed
1. **Safe Error Logging**: Updated storage service to prevent circular reference JSON errors
2. **Graceful Error Handling**: App now continues to work even if storage setup is incomplete
3. **Better User Feedback**: More descriptive error messages and logging
4. **Storage Test Scripts**: Created verification and setup tools

---

## 📋 Complete Setup Instructions

### Step 1: Create Storage Bucket (REQUIRED)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project (fnsaibersyxpedauhwfw)

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Direct link: https://supabase.com/dashboard/project/fnsaibersyxpedauhwfw/storage/buckets

3. **Create Bucket**
   - Click "New bucket" button
   - **Bucket name**: `verification-documents`
   - **Access**: Choose one:
     - `Public` - Easier setup, files accessible via public URLs
     - `Private` - More secure, requires authentication and RLS policies

4. **Click "Create bucket"**

### Step 2: Verify Setup

Run the verification script:
```bash
cd "c:\Users\User\Desktop\3.2_project\RouteLead\fe\scripts"
node test-storage-setup.js
```

Expected output:
```
✅ verification-documents bucket found
✅ Bucket access successful
```

### Step 3: Quick Setup Helper

For guided setup:
```bash
node quick-storage-setup.js
```

Expected output for successful setup:
```
✅ Buckets listed successfully
Available buckets: ['verification-documents']
✅ verification-documents bucket found
✅ Bucket access successful
✅ Public URL generated
```

## 🔧 If You Choose Private Bucket

If you want the more secure private bucket setup, run these SQL commands in Supabase SQL Editor after creating the private bucket:

```sql
-- Enable RLS on storage.objects (if not already enabled)
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

## 🧪 Testing After Setup

1. **Run Storage Test**:
   ```bash
   node test-storage-setup.js
   ```

2. **Test the App**:
   - Navigate to UploadFacePhoto page
   - Check console for success messages instead of errors
   - Try uploading a photo

## 📱 Expected App Behavior After Fix

### Before Fix:
```
WARN ⚠️ Bucket 'verification-documents' not found.
ERROR Error initializing verification flow: [RangeError: Maximum nesting level in JSON parser exceeded]
```

### After Fix:
```
🔍 Checking Supabase storage setup...
✅ Verification documents bucket is available
✅ Bucket access test successful
🚀 Initializing verification flow...
✅ Storage initialization completed
📋 Loading verification status and documents...
✅ Loaded 0 documents, status: null
```

## 🛠️ Troubleshooting

### If you see "Could not list buckets"
- Check your internet connection
- Verify Supabase credentials in `lib/supabase.ts`
- Make sure your Supabase project is active

### If you see "Bucket access test warning"
- For public buckets: This shouldn't happen
- For private buckets: Make sure RLS policies are correctly set

### If uploads fail
- Check bucket permissions
- Verify file size limits (default 50MB in Supabase)
- Check network connectivity

## 🎯 Next Steps

1. Create the bucket following Step 1 above
2. Run the test script to verify
3. Test the UploadFacePhoto page
4. Upload should work without JSON parsing errors

The app is now robust and will handle storage issues gracefully!
