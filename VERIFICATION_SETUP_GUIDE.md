# 🚀 Complete Verification System Setup Guide

## ✅ Status Check

### Backend Status
- ✅ **Backend Server**: Running successfully on port 8080
- ✅ **Database Connection**: Connected to Supabase PostgreSQL
- ✅ **Verification Endpoints**: All endpoints properly mapped and responding
- ✅ **Authentication**: JWT security configured

### Frontend Status  
- ✅ **SupabaseStorageService**: Complete implementation for file operations
- ✅ **VerificationFlowService**: Complete verification workflow management
- ✅ **VerificationDocuments Component**: Full UI with upload and submit functionality
- ✅ **Profile Integration**: Status display and access control implemented
- ✅ **Success Animations**: Integrated with existing animation system

## 🔧 Required Setup Steps

### Step 1: Set up Supabase Storage Bucket

**IMPORTANT**: You need to execute the SQL setup in your Supabase dashboard:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project**: `fnsaibersyxpedauhwfw`
3. **Open SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Create New Query**: Click "New Query"
5. **Copy and paste the entire contents** of `fe/scripts/setup-supabase-storage.sql`
6. **Execute the query**: Click "Run" button

### Step 2: Verify Storage Setup

After executing the SQL, run these verification queries:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'verification-documents';

-- Check RLS policies  
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%verification%';
```

## 🧪 Testing the Complete System

### Backend Test Commands (PowerShell)

```powershell
# Test basic connectivity
Invoke-WebRequest -Uri "http://localhost:8080/api/verification/123/status-with-docs" -Method GET

# Test document endpoints  
Invoke-WebRequest -Uri "http://localhost:8080/api/documents/123" -Method GET
```

### Frontend Testing

1. **Navigate to Profile Page**
2. **Click "Upload Verification Documents"** (should show "Not Verified" status)
3. **Upload test documents** for each category
4. **Click "Submit for Review"** 
5. **Verify success animation** and redirect to Profile
6. **Check status changed to "Pending"** (yellow color)

### Expected Verification Flow

1. **Initial State**: `verification_status = NULL` → Display: "Not Verified" (red)
2. **After Upload**: Files stored in Supabase Storage under `userId/documentType/`
3. **After Submit**: `verification_status = 'PENDING'` → Display: "Pending" (yellow)
4. **Admin Approval**: `verification_status = 'VERIFIED'` → Display: "Verified" (green)

### Storage Structure

Files will be organized as:
```
verification-documents/
├── {userId}/
│   ├── FACE_PHOTO/
│   │   └── {timestamp}_face_photo.jpg
│   ├── NIC/
│   │   └── {timestamp}_nic.pdf
│   ├── DRIVING_LICENCE/
│   │   └── {timestamp}_driving_licence.jpg
│   └── VEHICLE_REGISTRATION/
│       └── {timestamp}_vehicle_registration.pdf
```

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Users can only access their own documents
- ✅ Folder structure enforces user isolation: `{userId}/documentType/`
- ✅ Admin policies for reviewing all documents
- ✅ Private bucket (not publicly accessible)

### Access Control
- ✅ **Not Verified**: Can access upload page
- ✅ **Pending**: Can still edit documents  
- ✅ **Verified**: Upload page access blocked (from Profile.tsx)

## 🎨 User Experience Features

### Success Animation
- ✅ Same animation system as PersonalInformation
- ✅ Smooth transition to Profile page
- ✅ Success message display
- ✅ Status color changes

### Status Display
- 🔴 **"Not Verified"** - NULL status
- 🟡 **"Pending"** - PENDING status  
- 🟢 **"Verified"** - VERIFIED status

## 🚨 Troubleshooting

### If Upload Fails
1. Check Supabase Storage bucket exists
2. Verify RLS policies are applied
3. Check authentication token in frontend
4. Verify file size under 10MB limit

### If Backend Connection Fails
1. Confirm backend is running on port 8080
2. Check database connection in application.properties
3. Verify CORS configuration allows frontend domain

### If Status Not Updating
1. Check PostgreSQL driver_documents table
2. Verify verification_status_enum values
3. Check API endpoint responses in network tab

## 📱 Next Steps After Setup

1. **Test complete flow** with real image/PDF files
2. **Verify admin functionality** for changing status to VERIFIED
3. **Test access control** - verified users should not access upload page
4. **Performance testing** with multiple file uploads
5. **Error handling testing** - network failures, large files, etc.

---

**Status**: Ready for testing once Supabase Storage is set up! 🎉
