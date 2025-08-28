import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = Config.API_BASE;

// Types for verification API
export interface ProfileData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nicNumber?: string;
  profilePhotoUrl?: string;
  isVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  driverLicenseNumber?: string;
  licenseExpiryDate?: string;
  email?: string;
}

export interface VerificationStatus {
  isVerified: boolean;
  personalInfoComplete: boolean;
  verificationStatus: string | null;
}

export interface VerificationRequirements {
  personalInfoComplete: boolean;
  canStartVerification: boolean;
  isVerified: boolean;
  missingFields?: string[];
}

export interface DocumentData {
  id: string;
  documentType: string;
  documentUrl: string;
  verificationStatus: string;
  createdAt: string;
  expiryDate?: string;
}

export interface DocumentCompleteness {
  isComplete: boolean;
  requiredDocuments: string[];
  missingDocuments?: string[];
}

// Verification API Service Class
export class VerificationApiService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Extract the data field from the response
  }

  // Profile management
  static async getProfile(driverId: string): Promise<ProfileData> {
    return this.makeRequest<ProfileData>(`/profile/${driverId}`);
  }

  static async updateProfile(driverId: string, profileData: ProfileUpdateData): Promise<ProfileData> {
    return this.makeRequest<ProfileData>(`/profile/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  static async checkPersonalInfoCompleteness(driverId: string): Promise<{ isComplete: boolean }> {
    return this.makeRequest<{ isComplete: boolean }>(`/profile/${driverId}/personal-info/completeness`);
  }

  // Verification status management
  static async getVerificationStatus(driverId: string): Promise<VerificationStatus> {
    return this.makeRequest<VerificationStatus>(`/profile/${driverId}/verification/status`);
  }

  static async submitForVerification(driverId: string): Promise<ProfileData> {
    return this.makeRequest<ProfileData>(`/profile/${driverId}/verification/submit`, {
      method: 'POST',
    });
  }

  static async getVerificationRequirements(driverId: string): Promise<VerificationRequirements> {
    return this.makeRequest<VerificationRequirements>(`/profile/${driverId}/verification/requirements`);
  }

  // Document management
  static async getDriverDocuments(driverId: string): Promise<DocumentData[]> {
    return this.makeRequest<DocumentData[]>(`/documents/${driverId}`);
  }

  static async getDocumentByType(driverId: string, documentType: string): Promise<DocumentData> {
    return this.makeRequest<DocumentData>(`/documents/${driverId}/${documentType}`);
  }

  static async checkDocumentCompleteness(driverId: string): Promise<DocumentCompleteness> {
    return this.makeRequest<DocumentCompleteness>(`/documents/${driverId}/completeness`);
  }

  static async uploadDocument(driverId: string, file: any, documentType: string): Promise<{
    document: DocumentData;
    upload: any;
  }> {
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/documents/${driverId}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Upload Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  static async deleteDocument(driverId: string, documentId: string): Promise<void> {
    await this.makeRequest<void>(`/documents/${driverId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  static async getVerificationOverview(driverId: string): Promise<{
    allDocumentsVerified: boolean;
    uploadComplete: boolean;
    totalDocuments: number;
    verifiedCount: number;
    pendingCount: number;
    rejectedCount: number;
  }> {
    return this.makeRequest(`/documents/${driverId}/verification/overview`);
  }

  // New methods for Supabase Storage integration
  static async saveDocumentUrl(driverId: string, documentData: {
    documentType: string;
    documentUrl: string;
    filePath: string;
    expiryDate?: string;
  }): Promise<DocumentData> {
    return this.makeRequest<DocumentData>(`/documents/${driverId}/save-url`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  static async submitForReview(driverId: string): Promise<{
    success: boolean;
    message: string;
    verificationStatus: string;
  }> {
    return this.makeRequest(`/verification/${driverId}/submit`, {
      method: 'POST',
    });
  }

  static async getVerificationStatusWithDocs(driverId: string): Promise<{
    verificationStatus: string | null;
    isVerified: boolean;
    personalInfoComplete: boolean;
    documents: DocumentData[];
    canEdit: boolean;
  }> {
    return this.makeRequest(`/verification/${driverId}/status-with-docs`);
  }

  static async updateVerificationStatus(driverId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', adminNotes?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/verification/${driverId}/update-status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  static async getDocumentsByDriver(driverId: string): Promise<DocumentData[]> {
    return this.makeRequest<DocumentData[]>(`/documents/${driverId}/all`);
  }
}

export default VerificationApiService;
