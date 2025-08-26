-- =============================================
-- Supabase Storage Setup for RouteLead Verification
-- Run these commands in your Supabase SQL Editor
-- =============================================

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Create storage bucket programmatically (optional - can also be done via dashboard)
-- This will be handled by the SupabaseStorageService.initializeStorage() method

-- 3. Storage RLS Policies for verification-documents bucket

-- Policy: Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view their own verification documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own verification documents
CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own verification documents
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Admin policies (optional - for admin access to all documents)
CREATE POLICY "Admins can view all verification documents" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- =============================================
-- Verification: Test the setup
-- =============================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- List all policies on storage.objects
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =============================================
-- Alternative: Manual bucket creation via SQL
-- =============================================

-- If you want to create the bucket manually instead of using the service:
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents', 
  false,  -- private bucket
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
);
*/

-- =============================================
-- Testing Commands
-- =============================================

-- Test file path structure (should match: userId/documentType/filename)
-- Example: 797c6f16-a06a-46b4-ae9f-9ded8aa4ab27/FACE_PHOTO/1234567890_face_photo.jpg

-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'verification-documents';

-- View uploaded files (admin only)
SELECT * FROM storage.objects WHERE bucket_id = 'verification-documents' LIMIT 10;
