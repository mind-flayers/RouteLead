# 🔧 URGENT: Supabase Storage Manual Setup

## ❌ Current Issue: RLS Blocking Bucket Creation

The error you're seeing is **expected behavior** - Row Level Security (RLS) correctly prevents client applications from creating storage buckets. This is a security feature!

## ✅ **SOLUTION: Create Bucket Manually (2 minutes)**

### Step 1: Create Storage Bucket via Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/fnsaibersyxpedauhwfw
2. **Navigate to Storage**: Click "Storage" in the left sidebar
3. **Create New Bucket**: Click "New Bucket" button
4. **Bucket Configuration**:
   - **Name**: `verification-documents` (exactly this name)
   - **Public**: **UNCHECKED** (keep it private)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,application/pdf`

### Step 2: Set Up RLS Policies via Dashboard UI (EASIER)

**Option A: Dashboard UI (Recommended - No Permission Issues)**

1. **Go to Authentication > Policies**: In Supabase dashboard
2. **Select "storage" schema**: From the schema dropdown
3. **Select "objects" table**: From the table dropdown  
4. **Add Policy**: Click "Add Policy" button
5. **Create these 4 policies**:

**Policy 1: Upload Own Documents**
- **Name**: `Users can upload verification documents`
- **Operation**: INSERT
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'verification-documents' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 2: View Own Documents** 
- **Name**: `Users can view own verification documents`
- **Operation**: SELECT
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'verification-documents' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 3: Update Own Documents**
- **Name**: `Users can update own verification documents`  
- **Operation**: UPDATE
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'verification-documents' AND (storage.foldername(name))[1] = auth.uid()::text`

**Policy 4: Delete Own Documents**
- **Name**: `Users can delete own verification documents`
- **Operation**: DELETE  
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'verification-documents' AND (storage.foldername(name))[1] = auth.uid()::text`

**Option B: SQL (Advanced - May Need Service Role)**

1. **Go to SQL Editor**: Click "SQL Editor" in Supabase dashboard
2. **New Query**: Click "New Query"  
3. **Copy & Execute**: Paste the contents of `fe/scripts/setup-supabase-storage-simple.sql` (simplified version)
4. **Run**: Click the "Run" button

### Step 3: Verify Setup

After completing steps 1-2, run this verification query in SQL Editor:

```sql
-- Check bucket exists
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'verification-documents';

-- Check policies exist (simplified check)
SELECT count(*) as policy_count FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

You should see:
- ✅ Bucket exists with `public = false`
- ✅ Policy count >= 4 (the policies you created)

## 🎯 **After Manual Setup**

Once you complete the manual setup:

1. **Restart your React Native app**
2. **Try the verification flow again**
3. **The error should disappear**
4. **File uploads will work correctly**

## 🔍 **Why This Happened**

- ✅ **Security Working Correctly**: RLS prevents unauthorized bucket creation
- ✅ **Best Practice**: Administrative operations should be done via dashboard
- ✅ **Better Security**: Client apps shouldn't have bucket creation permissions
- ❌ **Permission Error**: SQL policies require service role, dashboard UI handles this automatically

## 🛠️ **If You Get Permission Errors**

**Error**: `ERROR: 42501: must be owner of table objects`

**Solution**: Use the **Dashboard UI method** instead of SQL:
1. Skip the SQL approach
2. Use Authentication > Policies in dashboard
3. Create policies through the UI (handles permissions automatically)
4. The UI method is actually easier and more reliable!

## 📱 **Updated Code Behavior**

I've updated the code to:
- ✅ **Graceful Handling**: No more crashes when bucket doesn't exist
- ✅ **Clear Instructions**: Console logs guide you to manual setup
- ✅ **Fallback Behavior**: App continues to work for viewing existing documents
- ✅ **Better UX**: Users get meaningful error messages instead of crashes

## 🚀 **Expected Flow After Setup**

1. **Manual bucket creation** (one-time setup)
2. **RLS policies applied** (one-time setup)  
3. **App works perfectly** with file uploads! 🎉

---

**⏱️ This should take about 2 minutes to complete. The app architecture is solid - just needs the one-time administrative setup!**
