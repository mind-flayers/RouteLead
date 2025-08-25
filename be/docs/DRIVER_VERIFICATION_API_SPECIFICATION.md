# Driver Verification API Specification

## 🎯 Overview

This document provides detailed API specifications for the driver verification system implementation. It includes all required endpoints, data models, request/response formats, and integration patterns.

## 📋 Data Models

### Profile Update DTO
```java
// ProfileUpdateDto.java
public class ProfileUpdateDto {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String nicNumber;
    private LocalDate dateOfBirth;
    private GenderEnum gender;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String driverLicenseNumber;
    private LocalDate licenseExpiryDate;
    // getters, setters, validation annotations
}
```

### Document Upload DTO
```java
// DocumentUploadDto.java
public class DocumentUploadDto {
    @NotNull
    private UUID driverId;
    
    @NotNull
    private DocumentTypeEnum documentType;
    
    @NotNull
    @URL
    private String documentUrl;
    
    private LocalDate expiryDate;
    
    private String description;
    // getters, setters, validation
}
```

### Verification Status Response DTO
```java
// VerificationStatusDto.java
public class VerificationStatusDto {
    private UUID driverId;
    private boolean isVerified;
    private VerificationStatusEnum verificationStatus;
    private boolean personalInfoComplete;
    private Map<DocumentTypeEnum, DocumentStatusDto> documentStatuses;
    private boolean vehicleInfoComplete;
    private List<String> missingRequirements;
    private ZonedDateTime lastUpdated;
    // getters, setters
}

// DocumentStatusDto.java
public class DocumentStatusDto {
    private DocumentTypeEnum documentType;
    private boolean uploaded;
    private VerificationStatusEnum verificationStatus;
    private String documentUrl;
    private ZonedDateTime uploadedAt;
    private String rejectionReason;
    // getters, setters
}
```

### Vehicle Information DTO
```java
// VehicleInfoDto.java
public class VehicleInfoDto {
    private UUID driverId;
    private String vehicleType;
    private String manufacturer;
    private String model;
    private Integer yearOfManufacture;
    private String color;
    private String plateNumber;
    private boolean isOwner;
    private List<String> vehiclePhotoUrls;
    // getters, setters, validation
}
```

## 🔌 REST API Endpoints

### Profile Management APIs

#### 1. Get Profile Information
```
GET /api/profile/{userId}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "driver@example.com",
  "role": "DRIVER",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+94771234567",
  "nicNumber": "123456789V",
  "profilePhotoUrl": "https://storage.url/profile.jpg",
  "isVerified": false,
  "verificationStatus": "PENDING",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "addressLine1": "123 Main Street",
  "addressLine2": "Colombo 03",
  "city": "Colombo",
  "driverLicenseNumber": "B1234567",
  "licenseExpiryDate": "2025-12-31",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### 2. Update Profile Information
```
PUT /api/profile/{userId}
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+94771234567",
  "nicNumber": "123456789V",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "addressLine1": "123 Main Street",
  "addressLine2": "Colombo 03",
  "city": "Colombo",
  "driverLicenseNumber": "B1234567",
  "licenseExpiryDate": "2025-12-31"
}
```

**Response**: Updated profile object (same as GET response)

#### 3. Get Verification Status
```
GET /api/profile/{userId}/verification-status
```

**Response**:
```json
{
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "isVerified": false,
  "verificationStatus": "PENDING",
  "personalInfoComplete": true,
  "documentStatuses": {
    "FACE_PHOTO": {
      "documentType": "FACE_PHOTO",
      "uploaded": true,
      "verificationStatus": "APPROVED",
      "documentUrl": "https://storage.url/face.jpg",
      "uploadedAt": "2023-01-01T00:00:00Z"
    },
    "DRIVERS_LICENSE": {
      "documentType": "DRIVERS_LICENSE",
      "uploaded": true,
      "verificationStatus": "PENDING",
      "documentUrl": "https://storage.url/license.jpg",
      "uploadedAt": "2023-01-01T00:00:00Z"
    },
    "NATIONAL_ID": {
      "documentType": "NATIONAL_ID",
      "uploaded": false,
      "verificationStatus": null,
      "documentUrl": null,
      "uploadedAt": null
    }
  },
  "vehicleInfoComplete": false,
  "missingRequirements": [
    "Upload National ID front and back",
    "Complete vehicle information",
    "Upload vehicle documents"
  ],
  "lastUpdated": "2023-01-01T00:00:00Z"
}
```

#### 4. Submit for Verification
```
POST /api/profile/{userId}/verification
```

**Request Body** (optional):
```json
{
  "additionalNotes": "All documents uploaded and ready for review"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile submitted for verification",
  "verificationStatus": "PENDING",
  "submittedAt": "2023-01-01T00:00:00Z"
}
```

#### 5. Check Personal Information Completeness
```
GET /api/profile/{userId}/personal-info-complete
```

**Response**:
```json
{
  "complete": true,
  "missingFields": [],
  "requiredFields": [
    "firstName",
    "lastName", 
    "phoneNumber",
    "nicNumber",
    "dateOfBirth",
    "addressLine1",
    "city"
  ]
}
```

### Document Management APIs

#### 1. Upload Document
```
POST /api/documents/upload
```

**Request Body**:
```json
{
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "documentType": "DRIVERS_LICENSE",
  "documentUrl": "https://storage.url/document.jpg",
  "expiryDate": "2025-12-31",
  "description": "Front side of driving license"
}
```

**Response**:
```json
{
  "id": "doc-123e4567-e89b-12d3-a456-426614174000",
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "documentType": "DRIVERS_LICENSE",
  "documentUrl": "https://storage.url/document.jpg",
  "verificationStatus": "PENDING",
  "expiryDate": "2025-12-31",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### 2. Get Driver Documents
```
GET /api/documents/driver/{driverId}
```

**Query Parameters**:
- `documentType` (optional): Filter by document type
- `verificationStatus` (optional): Filter by verification status

**Response**:
```json
{
  "documents": [
    {
      "id": "doc-123e4567-e89b-12d3-a456-426614174000",
      "documentType": "DRIVERS_LICENSE",
      "documentUrl": "https://storage.url/document.jpg",
      "verificationStatus": "APPROVED",
      "expiryDate": "2025-12-31",
      "verifiedBy": "admin-123",
      "verifiedAt": "2023-01-02T00:00:00Z",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "totalCount": 1
}
```

#### 3. Delete Document
```
DELETE /api/documents/{documentId}
```

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### 4. Admin: Verify Document
```
PUT /api/documents/{documentId}/verify
```

**Request Body**:
```json
{
  "verificationStatus": "APPROVED",
  "rejectionReason": null,
  "notes": "Document verified successfully"
}
```

**Response**:
```json
{
  "id": "doc-123e4567-e89b-12d3-a456-426614174000",
  "verificationStatus": "APPROVED",
  "verifiedBy": "admin-123",
  "verifiedAt": "2023-01-02T00:00:00Z",
  "notes": "Document verified successfully"
}
```

### Vehicle Management APIs

#### 1. Save Vehicle Information
```
POST /api/vehicles/driver/{driverId}
```

**Request Body**:
```json
{
  "vehicleType": "THREE_WHEEL",
  "manufacturer": "Toyota",
  "model": "Hiace",
  "yearOfManufacture": 2020,
  "color": "White",
  "plateNumber": "AAA-1234",
  "isOwner": true,
  "maxWeightKg": 1000,
  "maxVolumeM3": 5.0
}
```

**Response**:
```json
{
  "id": 1,
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "vehicleType": "THREE_WHEEL",
  "manufacturer": "Toyota",
  "model": "Hiace",
  "yearOfManufacture": 2020,
  "color": "White",
  "plateNumber": "AAA-1234",
  "maxWeightKg": 1000,
  "maxVolumeM3": 5.0,
  "vehiclePhotos": [],
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### 2. Upload Vehicle Photos
```
POST /api/vehicles/{vehicleId}/photos
```

**Request Body**:
```json
{
  "photos": [
    {
      "type": "FRONT_VIEW",
      "url": "https://storage.url/vehicle-front.jpg"
    },
    {
      "type": "BACK_VIEW", 
      "url": "https://storage.url/vehicle-back.jpg"
    },
    {
      "type": "INSIDE_VIEW",
      "url": "https://storage.url/vehicle-inside.jpg"
    }
  ]
}
```

**Response**:
```json
{
  "vehicleId": 1,
  "uploadedPhotos": 3,
  "photos": [
    {
      "type": "FRONT_VIEW",
      "url": "https://storage.url/vehicle-front.jpg",
      "uploadedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### 3. Get Vehicle Information
```
GET /api/vehicles/driver/{driverId}
```

**Response**:
```json
{
  "vehicle": {
    "id": 1,
    "driverId": "123e4567-e89b-12d3-a456-426614174000",
    "vehicleType": "THREE_WHEEL",
    "manufacturer": "Toyota",
    "model": "Hiace",
    "yearOfManufacture": 2020,
    "color": "White",
    "plateNumber": "AAA-1234",
    "maxWeightKg": 1000,
    "maxVolumeM3": 5.0,
    "vehiclePhotos": [
      {
        "type": "FRONT_VIEW",
        "url": "https://storage.url/vehicle-front.jpg"
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

### File Upload APIs

#### 1. Generate Upload URL
```
POST /api/files/upload-url
```

**Request Body**:
```json
{
  "fileName": "license-front.jpg",
  "fileType": "image/jpeg",
  "documentType": "DRIVERS_LICENSE",
  "driverId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response**:
```json
{
  "uploadUrl": "https://storage.supabase.co/upload-signed-url",
  "finalUrl": "https://storage.supabase.co/final-url",
  "expiresAt": "2023-01-01T01:00:00Z"
}
```

#### 2. Confirm Upload
```
POST /api/files/confirm-upload
```

**Request Body**:
```json
{
  "finalUrl": "https://storage.supabase.co/final-url",
  "documentType": "DRIVERS_LICENSE",
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "expiryDate": "2025-12-31"
}
```

**Response**:
```json
{
  "documentId": "doc-123e4567-e89b-12d3-a456-426614174000",
  "documentUrl": "https://storage.supabase.co/final-url",
  "status": "uploaded"
}
```

## 🔐 Authentication & Authorization

### JWT Token Requirements
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Role-Based Access Control
- **DRIVER**: Can access only their own data
- **ADMIN**: Can access all driver data and perform verification actions
- **CUSTOMER**: No access to verification endpoints

### Permission Matrix
| Endpoint | DRIVER | ADMIN | CUSTOMER |
|----------|--------|-------|----------|
| GET /api/profile/{userId} | Own only | All | Own only |
| PUT /api/profile/{userId} | Own only | All | Own only |
| POST /api/documents/upload | Own only | All | ❌ |
| PUT /api/documents/{id}/verify | ❌ | ✅ | ❌ |

## 📱 Frontend Integration Patterns

### API Service Implementation
```typescript
// services/verificationApi.ts
export class VerificationApiService {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL;
  
  static async getProfile(userId: string): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/api/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get profile: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async uploadDocument(file: File, metadata: DocumentMetadata): Promise<DocumentResponse> {
    // 1. Generate upload URL
    const uploadUrlResponse = await this.generateUploadUrl(metadata);
    
    // 2. Upload file to Supabase Storage
    const uploadResponse = await fetch(uploadUrlResponse.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }
    
    // 3. Confirm upload and save metadata
    return this.confirmUpload({
      finalUrl: uploadUrlResponse.finalUrl,
      documentType: metadata.documentType,
      driverId: metadata.driverId,
      expiryDate: metadata.expiryDate
    });
  }
  
  static async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const response = await fetch(`${this.baseUrl}/api/profile/${userId}/verification-status`, {
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    });
    
    return response.json();
  }
  
  private static async getAuthToken(): Promise<string> {
    // Get token from Supabase auth
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }
}
```

### React Native Hook Implementation
```typescript
// hooks/useVerification.ts
export const useVerification = (userId: string) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await VerificationApiService.getVerificationStatus(userId);
      setVerificationStatus(status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  const uploadDocument = useCallback(async (file: File, documentType: DocumentType) => {
    try {
      const result = await VerificationApiService.uploadDocument(file, {
        documentType,
        driverId: userId,
        expiryDate: documentType === 'DRIVERS_LICENSE' ? new Date('2025-12-31') : undefined
      });
      
      // Refresh verification status
      await fetchVerificationStatus();
      
      return result;
    } catch (err) {
      throw err;
    }
  }, [userId, fetchVerificationStatus]);
  
  const submitForVerification = useCallback(async () => {
    try {
      await VerificationApiService.submitForVerification(userId);
      await fetchVerificationStatus();
    } catch (err) {
      throw err;
    }
  }, [userId, fetchVerificationStatus]);
  
  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);
  
  return {
    verificationStatus,
    loading,
    error,
    uploadDocument,
    submitForVerification,
    refreshStatus: fetchVerificationStatus
  };
};
```

## 📊 Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "documentType",
        "message": "Document type is required"
      }
    ],
    "timestamp": "2023-01-01T00:00:00Z",
    "path": "/api/documents/upload"
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing JWT token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DOCUMENT_UPLOAD_ERROR`: File upload failed
- `VERIFICATION_ERROR`: Verification process error
- `RATE_LIMIT_ERROR`: Too many requests

## 🧪 Testing Examples

### Unit Test Example (Jest)
```typescript
// tests/verificationApi.test.ts
describe('VerificationApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });
  
  it('should upload document successfully', async () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const mockMetadata = {
      documentType: 'DRIVERS_LICENSE' as DocumentType,
      driverId: 'test-user-id',
      expiryDate: new Date('2025-12-31')
    };
    
    fetchMock
      .mockResponseOnce(JSON.stringify({
        uploadUrl: 'https://upload.url',
        finalUrl: 'https://final.url'
      }))
      .mockResponseOnce('', { status: 200 })
      .mockResponseOnce(JSON.stringify({
        documentId: 'doc-123',
        documentUrl: 'https://final.url'
      }));
    
    const result = await VerificationApiService.uploadDocument(mockFile, mockMetadata);
    
    expect(result.documentId).toBe('doc-123');
    expect(result.documentUrl).toBe('https://final.url');
  });
});
```

### Integration Test Example
```java
// tests/ProfileControllerTest.java
@SpringBootTest
@AutoConfigureTestDatabase
class ProfileControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldUpdateProfileSuccessfully() {
        // Given
        ProfileUpdateDto updateDto = new ProfileUpdateDto();
        updateDto.setFirstName("John");
        updateDto.setLastName("Doe");
        
        // When
        ResponseEntity<ProfileDto> response = restTemplate.exchange(
            "/api/profile/test-user-id",
            HttpMethod.PUT,
            new HttpEntity<>(updateDto, getAuthHeaders()),
            ProfileDto.class
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("John", response.getBody().getFirstName());
    }
    
    private HttpHeaders getAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + generateTestToken());
        return headers;
    }
}
```

---

This comprehensive API specification provides all the technical details needed to implement the driver verification system. Each endpoint includes complete request/response examples, error handling, and integration patterns for both backend and frontend development.
