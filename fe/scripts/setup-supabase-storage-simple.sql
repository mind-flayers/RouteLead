-- =============================================
-- SIMPLIFIED Supabase Storage Setup (No Admin Required)
-- Run this in your Supabase SQL Editor with regular permissions
-- =============================================

-- 1. Check if bucket already exists
SELECT name, public FROM storage.buckets WHERE name = 'verification-documents';

-- 2. If bucket doesn't exist, create it manually via dashboard UI instead of SQL
-- Go to Storage > New Bucket > Name: verification-documents, Public: false

-- 3. Basic verification query (this should work)
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- =============================================
-- That's it! The RLS policies will be set up via dashboard UI
-- =============================================
