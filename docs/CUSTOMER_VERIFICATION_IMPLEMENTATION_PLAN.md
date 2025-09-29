# Customer Verification Implementation Plan

## 🎯 Project Overview
Implement customer verification functionality that mirrors the existing driver verification system, allowing customers to upload verification documents and receive verified status.

## 📊 Current System Analysis

### ✅ Existing Infrastructure
- **Database**: `profiles` table has all required fields:
  - `profile_photo_url TEXT` - for profile photo storage
  - `nic_photo_url TEXT` - for NIC photo storage  
  - `verification_status verification_status_enum` - PENDING/APPROVED/REJECTED
  - `is_verified BOOLEAN` - verification flag
- **ProfileService**: Has generic verification methods:
  - `updateVerificationStatus(UUID userId, VerificationStatusEnum status)`
  - `submitForVerification(UUID userId)`  
  - `getVerificationStatus(UUID userId)`
- **File Upload**: Existing FileUploadService for Supabase integration
- **Admin System**: Can review and approve/reject using existing admin tools

### 🔄 Driver vs Customer Verification Comparison
| Component | Driver System | Customer System (Planned) |
|-----------|---------------|---------------------------|
| **Documents** | 5 types (Face, License, NIC, Vehicle Reg, Insurance) | 2 types (Face, NIC) |
| **Storage** | `driver_documents` table | `profiles` table fields |
| **Service** | `DriverDocumentService` | `CustomerVerificationService` |
| **API** | `/api/documents/{driverId}/*` | `/api/customer/{customerId}/verification/*` |
| **Frontend** | Complex multi-step flow | Simple single-page upload |

## 🏗️ Implementation Strategy

### ✨ Why This Approach is Optimal
1. **No Database Changes**: Leverages existing `profiles` table fields
2. **Code Reuse**: Uses existing `ProfileService` and `FileUploadService`
3. **No Breaking Changes**: Driver system remains untouched
4. **Consistent UX**: Same verification status display patterns
5. **Admin Compatible**: Works with existing admin review tools

## 📋 Implementation Plan

### Phase 1: Backend Services (Day 1)

#### 1.1 Create CustomerVerificationService
**File**: `be/src/main/java/com/example/be/service/CustomerVerificationService.java`

```java
@Service
public class CustomerVerificationService {
    // Upload customer photo (NIC or Profile) to Supabase and update profile
    public Profile uploadCustomerPhoto(UUID customerId, String photoType, String photoUrl)
    
    // Submit customer for verification (set status to PENDING)  
    public Profile submitCustomerForVerification(UUID customerId)
    
    // Get customer verification status and photo URLs
    public Map<String, Object> getCustomerVerificationStatus(UUID customerId)
    
    // Check if customer has uploaded required photos
    public boolean hasRequiredPhotos(UUID customerId)
}
```

**Key Methods**:
- `uploadCustomerPhoto()` - Update `profile_photo_url` or `nic_photo_url` in profiles table
- `submitCustomerForVerification()` - Validate photos exist, then call ProfileService.submitForVerification()
- `getCustomerVerificationStatus()` - Return verification status with photo URLs

#### 1.2 Create CustomerVerificationController  
**File**: `be/src/main/java/com/example/be/controller/CustomerVerificationController.java`

```java
@RestController
@RequestMapping("/api/customer")
public class CustomerVerificationController {
    // Upload photo endpoint
    @PostMapping("/{customerId}/verification/upload")
    ResponseEntity<Map<String, Object>> uploadPhoto(@PathVariable UUID customerId, 
                                                   @RequestParam("file") MultipartFile file,
                                                   @RequestParam("photoType") String photoType)
    
    // Submit for verification
    @PostMapping("/{customerId}/verification/submit") 
    ResponseEntity<Map<String, Object>> submitForVerification(@PathVariable UUID customerId)
    
    // Get verification status
    @GetMapping("/{customerId}/verification/status")
    ResponseEntity<Map<String, Object>> getVerificationStatus(@PathVariable UUID customerId)
}
```

**Endpoints**:
- `POST /{customerId}/verification/upload` - Upload NIC or profile photo
- `POST /{customerId}/verification/submit` - Submit customer for verification  
- `GET /{customerId}/verification/status` - Get current verification status

### Phase 2: Frontend Integration (Day 2)

#### 2.1 Create CustomerVerificationApiService
**File**: `fe/services/customerVerificationApiService.ts`

```typescript
export class CustomerVerificationApiService {
  // Upload photo (NIC or profile)
  static async uploadPhoto(customerId: string, file: any, photoType: 'nic' | 'profile'): Promise<any>
  
  // Submit for verification
  static async submitForVerification(customerId: string): Promise<any>
  
  // Get verification status  
  static async getVerificationStatus(customerId: string): Promise<VerificationStatus>
}
```

#### 2.2 Update CustomerVerification.tsx
**Current State**: Basic UI with image picker, no backend integration
**Target State**: Full backend integration with upload and submission

```typescript
// Add state for API communication
const [isUploading, setIsUploading] = useState(false);
const [uploadStatus, setUploadStatus] = useState<{nic?: boolean, profile?: boolean}>({});

// Integrate uploadPhoto with backend API
const uploadPhoto = async (photoUri: string, photoType: 'nic' | 'profile') => {
  const result = await CustomerVerificationApiService.uploadPhoto(userId, photoUri, photoType);
  setUploadStatus(prev => ({...prev, [photoType]: true}));
};

// Integrate handleSubmit with backend API
const handleSubmit = async () => {
  await CustomerVerificationApiService.submitForVerification(userId);
  // Navigate to profile with success parameter
  router.push('/pages/customer/Profile?verificationSubmitted=true');
};
```

#### 2.3 Update Customer Profile.tsx  
**Current State**: No verification status display
**Target State**: Show verification status like driver profile

```typescript
// Add verification status state
const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

// Add verification status fetching
useEffect(() => {
  const fetchVerificationStatus = async () => {
    const status = await CustomerVerificationApiService.getVerificationStatus(userId);
    setVerificationStatus(status);
  };
  fetchVerificationStatus();
}, []);

// Add verification status display component
const getVerificationStatusDisplay = () => {
  switch (verificationStatus?.status) {
    case 'APPROVED': return { text: 'Verified', color: 'text-green-500' };
    case 'PENDING': return { text: 'Pending', color: 'text-yellow-500' };  
    case 'REJECTED': return { text: 'Rejected', color: 'text-red-500' };
    default: return { text: 'Not Verified', color: 'text-red-500' };
  }
};
```

### Phase 3: Testing & Validation (Day 3)

#### 3.1 Backend API Testing
- Test photo upload endpoints with Postman
- Verify file upload to Supabase Storage
- Test verification status updates in database
- Validate error handling and edge cases

#### 3.2 Frontend Integration Testing  
- Test photo picker and upload flow
- Verify success/error message handling
- Test navigation after submission
- Validate profile status display

#### 3.3 End-to-End Testing
- Complete customer verification flow
- Admin verification review process
- Status updates across all UI components

## 🔧 Technical Implementation Details

### Database Schema (No Changes Required)
```sql
-- profiles table already has required fields:
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  profile_photo_url TEXT,           -- For profile photo
  nic_photo_url TEXT,               -- For NIC photo  
  verification_status verification_status_enum,  -- PENDING/APPROVED/REJECTED
  is_verified BOOLEAN DEFAULT FALSE,
  -- ... other existing fields
);
```

### API Endpoints Design
```
POST /api/customer/{customerId}/verification/upload
  - Body: multipart/form-data with file and photoType
  - Response: { status: "success", photoUrl: "...", message: "..." }

POST /api/customer/{customerId}/verification/submit  
  - Response: { status: "success", verificationStatus: "PENDING" }

GET /api/customer/{customerId}/verification/status
  - Response: { 
      verificationStatus: "PENDING", 
      isVerified: false,
      hasProfilePhoto: true,
      hasNicPhoto: true,
      profilePhotoUrl: "...",
      nicPhotoUrl: "..."
    }
```

### File Upload Flow
1. Customer selects photo in UI
2. Frontend calls `/upload` endpoint with file and photoType  
3. Backend validates file and uploads to Supabase Storage
4. Backend updates corresponding field in profiles table
5. Frontend receives success response with photo URL
6. UI updates to show uploaded photo

### Verification Submission Flow
1. Frontend validates both photos are uploaded
2. Frontend calls `/submit` endpoint
3. Backend validates required photos exist
4. Backend calls ProfileService.submitForVerification()
5. Database updated: verification_status = 'PENDING'
6. Frontend navigates to Profile page with success parameter

## 🎨 UI/UX Considerations

### Verification Status Display Colors
- **Not Verified**: Red (`text-red-500`)
- **Pending**: Yellow (`text-yellow-500`) ⭐ 
- **Approved**: Green (`text-green-500`)
- **Rejected**: Red (`text-red-500`)

### Success Messages
- Photo Upload: "Photo uploaded successfully!"
- Verification Submission: "Verification submitted successfully! We will review your documents shortly."

### Error Handling
- File size limits
- File type validation
- Network errors
- Backend API errors

## 🚀 Deployment Checklist

### Backend Deployment
- [ ] Deploy CustomerVerificationService
- [ ] Deploy CustomerVerificationController  
- [ ] Test API endpoints in staging
- [ ] Verify Supabase Storage integration

### Frontend Deployment
- [ ] Deploy updated CustomerVerification.tsx
- [ ] Deploy updated customer Profile.tsx
- [ ] Deploy CustomerVerificationApiService
- [ ] Test complete user flow

### Admin Integration
- [ ] Verify admin can see customer verification requests
- [ ] Test admin approval/rejection flow
- [ ] Confirm status updates propagate to customer UI

## 📈 Success Metrics

### Functional Requirements ✅
1. Customer can upload NIC photo and profile photo
2. Customer can submit for verification
3. verification_status changes to PENDING after submission  
4. Profile page shows "Pending" status in yellow color
5. Admin can review and approve/reject customer verification

### Technical Requirements ✅  
1. No breaking changes to existing driver verification system
2. Reuses existing ProfileService and FileUploadService
3. No database schema changes required
4. Consistent API design patterns
5. Proper error handling and user feedback

## 🔄 Future Enhancements

### Phase 4 (Optional)
- Email notifications for verification status changes
- Document expiry tracking for NIC
- Bulk admin verification tools
- Verification analytics dashboard
- Mobile app push notifications

## 📚 References

### Existing Code to Study
- `DriverDocumentService.java` - Document management patterns
- `DocumentController.java` - API endpoint patterns  
- `ProfileService.java` - Verification status management
- Driver verification UI components - UI patterns and flows

### Database References
- `profiles` table schema in `table.sql`
- `verification_status_enum` definition
- Existing file upload patterns with Supabase

---

**Implementation Priority**: HIGH
**Estimated Effort**: 3 days  
**Risk Level**: LOW (leverages existing infrastructure)
**Breaking Changes**: NONE