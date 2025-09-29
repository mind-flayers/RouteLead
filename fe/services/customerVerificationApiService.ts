import { supabase } from '@/lib/supabase';
import { Config } from '../constants/Config';

// Base URL for the backend API
const API_BASE_URL = Config.API_BASE;

// Interface definitions
export interface CustomerVerificationStatus {
  customerId: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  isVerified: boolean;
  hasProfilePhoto: boolean;
  hasNicPhoto: boolean;
  profilePhotoUrl?: string;
  nicPhotoUrl?: string;
  hasRequiredPhotos: boolean;
  personalInfoComplete: boolean;
}

export interface VerificationRequirements {
  personalInfoComplete: boolean;
  profilePhotoRequired: boolean;
  nicPhotoRequired: boolean;
  canSubmit: boolean;
  missingPersonalInfoFields?: string[];
}

export interface UploadPhotoResponse {
  status: 'success' | 'error';
  message: string;
  photoUrl?: string;
  photoType?: string;
  verificationInfo?: CustomerVerificationStatus;
}

export interface SubmitVerificationResponse {
  status: 'success' | 'error';
  message: string;
  verificationStatus?: string;
  isVerified?: boolean;
  verificationInfo?: CustomerVerificationStatus;
}

/**
 * API Service for customer verification functionality
 * Handles communication with backend customer verification endpoints
 */
export class CustomerVerificationApiService {
  
  /**
   * Make authenticated request to backend API
   */
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const url = `${API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Upload customer photo (NIC or Profile)
   */
  static async uploadPhoto(
    customerId: string, 
    photoUri: string, 
    photoType: 'nic' | 'profile'
  ): Promise<UploadPhotoResponse> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Create file object from URI
      const fileResponse = await fetch(photoUri);
      const fileBlob = await fileResponse.blob();
      const fileName = `${photoType}_photo_${Date.now()}.jpg`;
      
      // Add file to form data
      formData.append('file', fileBlob, fileName);
      formData.append('photoType', photoType);

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/verification/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to upload ${photoType} photo`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error(`Error uploading ${photoType} photo:`, error);
      throw error;
    }
  }

  /**
   * Submit customer for verification
   */
  static async submitForVerification(customerId: string): Promise<SubmitVerificationResponse> {
    return this.makeRequest<SubmitVerificationResponse>(`/customer/${customerId}/verification/submit`, {
      method: 'POST',
    });
  }

  /**
   * Get customer verification status
   */
  static async getVerificationStatus(customerId: string): Promise<{
    status: string;
    data: CustomerVerificationStatus;
    message: string;
  }> {
    return this.makeRequest(`/customer/${customerId}/verification/status`);
  }

  /**
   * Get verification requirements for customer
   */
  static async getVerificationRequirements(customerId: string): Promise<{
    status: string;
    data: VerificationRequirements;
    message: string;
  }> {
    return this.makeRequest(`/customer/${customerId}/verification/requirements`);
  }

  /**
   * Delete customer photo
   */
  static async deletePhoto(customerId: string, photoType: 'nic' | 'profile'): Promise<{
    status: string;
    message: string;
    verificationInfo?: CustomerVerificationStatus;
  }> {
    return this.makeRequest(`/customer/${customerId}/verification/photo/${photoType}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update verification status (Admin only)
   */
  static async updateVerificationStatus(
    customerId: string, 
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<{
    status: string;
    message: string;
    verificationStatus: string;
    isVerified: boolean;
  }> {
    const params = new URLSearchParams({ status: status.toLowerCase() });
    if (notes) {
      params.append('notes', notes);
    }

    return this.makeRequest(`/customer/${customerId}/verification/status?${params.toString()}`, {
      method: 'PATCH',
    });
  }

  /**
   * Check if customer can submit for verification
   */
  static async canSubmitForVerification(customerId: string): Promise<{
    canSubmit: boolean;
    reasons: string[];
  }> {
    try {
      const requirementsResponse = await this.getVerificationRequirements(customerId);
      const requirements = requirementsResponse.data;
      const reasons: string[] = [];

      if (!requirements.personalInfoComplete) {
        if (requirements.missingPersonalInfoFields) {
          reasons.push(`Complete personal information: ${requirements.missingPersonalInfoFields.join(', ')}`);
        } else {
          reasons.push('Complete personal information required');
        }
      }

      if (requirements.profilePhotoRequired) {
        reasons.push('Profile photo required');
      }

      if (requirements.nicPhotoRequired) {
        reasons.push('NIC photo required');
      }

      return {
        canSubmit: requirements.canSubmit,
        reasons
      };
      
    } catch (error) {
      console.error('Error checking submission requirements:', error);
      return {
        canSubmit: false,
        reasons: ['Unable to check requirements. Please try again.']
      };
    }
  }

  /**
   * Get display text and color for verification status
   */
  static getVerificationStatusDisplay(status: string | null | undefined): {
    text: string;
    color: string;
    bgColor: string;
  } {
    switch (status) {
      case 'APPROVED':
        return { 
          text: 'Verified', 
          color: 'text-green-600', 
          bgColor: 'bg-green-100' 
        };
      case 'PENDING':
        return { 
          text: 'Pending', 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100' 
        };
      case 'REJECTED':
        return { 
          text: 'Rejected', 
          color: 'text-red-600', 
          bgColor: 'bg-red-100' 
        };
      default:
        return { 
          text: 'Not Verified', 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100' 
        };
    }
  }

  /**
   * Helper method to handle API errors consistently
   */
  static handleApiError(error: any): string {
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}