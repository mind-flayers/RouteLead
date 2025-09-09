import { Alert } from 'react-native';
import { SupabaseStorageService, FileUploadResult } from './supabaseStorageService';
import { VerificationApiService, DocumentData } from './verificationApiService';

// Safe error logging to avoid circular reference issues
function safeLog(level: 'log' | 'warn' | 'error', message: string, error?: any) {
  console[level](message);
  if (error) {
    if (typeof error === 'string') {
      console[level]('Error details:', error);
    } else if (error.message) {
      console[level]('Error message:', error.message);
    } else {
      console[level]('Error type:', typeof error);
    }
  }
}

export interface VerificationDocument {
  id?: string;
  documentType: string;
  documentUrl: string;
  filePath: string;
  localUri?: string;
  uploaded: boolean;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  expiryDate?: string;
}

export interface VerificationFlowState {
  documents: VerificationDocument[];
  allUploaded: boolean;
  submittedForReview: boolean;
  verificationStatus: string | null;
  canEdit: boolean;
}

export class VerificationFlowService {
  private static instance: VerificationFlowService;
  private flowState: VerificationFlowState = {
    documents: [],
    allUploaded: false,
    submittedForReview: false,
    verificationStatus: null,
    canEdit: true
  };

  static getInstance(): VerificationFlowService {
    if (!this.instance) {
      this.instance = new VerificationFlowService();
    }
    return this.instance;
  }

  /**
   * Initialize the verification flow for a user
   */
  async initializeFlow(userId: string): Promise<VerificationFlowState> {
    try {
      safeLog('log', '🚀 Initializing verification flow...');
      
      // Initialize storage if needed (graceful failure)
      try {
        await SupabaseStorageService.initializeStorage();
        safeLog('log', '✅ Storage initialization completed');
      } catch (storageError) {
        safeLog('warn', 'Storage initialization warning', storageError);
        // Continue anyway - user can still view existing documents
      }
      
      safeLog('log', '📋 Loading verification status and documents...');
      
      // Load existing verification status and documents
      let statusData;
      try {
        statusData = await VerificationApiService.getVerificationStatusWithDocs(userId);
        safeLog('log', `✅ API Response received for user ${userId}`);
      } catch (apiError) {
        safeLog('warn', 'API call failed, providing fallback data', apiError);
        
        // Provide fallback data structure if API fails
        statusData = {
          verificationStatus: null,
          isVerified: false,
          personalInfoComplete: false,
          documents: [],
          canEdit: true
        };
      }
      
      this.flowState = {
        documents: statusData.documents.map(doc => ({
          id: doc.id,
          documentType: doc.documentType,
          documentUrl: doc.documentUrl,
          filePath: doc.documentUrl, // Store the full URL
          uploaded: true,
          verificationStatus: doc.verificationStatus as any,
          expiryDate: doc.expiryDate
        })),
        allUploaded: statusData.documents.length >= this.getRequiredDocumentTypes().length,
        submittedForReview: statusData.verificationStatus === 'PENDING' || statusData.verificationStatus === 'APPROVED',
        verificationStatus: statusData.verificationStatus,
        canEdit: statusData.canEdit
      };
      
      safeLog('log', `✅ Loaded ${this.flowState.documents.length} documents, status: ${this.flowState.verificationStatus}`);
      
      return this.flowState;
    } catch (error) {
      safeLog('error', 'Error initializing verification flow', error);
      // Provide fallback state if API fails
      this.flowState = {
        documents: [],
        allUploaded: false,
        submittedForReview: false,
        verificationStatus: null,
        canEdit: true
      };
      
      // Re-throw with user-friendly message
      throw new Error('Failed to initialize verification flow. Please check your connection and try again.');
    }
  }

  /**
   * Upload a document file
   */
  async uploadDocument(
    userId: string,
    file: { uri: string; type: string; name: string },
    documentType: string,
    expiryDate?: string
  ): Promise<VerificationDocument> {
    try {
      safeLog('log', `📤 Starting document upload: ${documentType}`);
      
      // Upload to Supabase Storage
      const uploadResult: FileUploadResult = await SupabaseStorageService.uploadFile(
        file,
        userId,
        documentType
      );
      
      safeLog('log', '💾 Saving document URL to database...');
      
      // Save document URL to database
      const documentData = await VerificationApiService.saveDocumentUrl(userId, {
        documentType,
        documentUrl: uploadResult.fullUrl,
        filePath: uploadResult.path,
        expiryDate
      });
      
      // Create verification document object
      const verificationDoc: VerificationDocument = {
        id: documentData.id,
        documentType,
        documentUrl: uploadResult.fullUrl,
        filePath: uploadResult.path,
        localUri: file.uri,
        uploaded: true,
        verificationStatus: documentData.verificationStatus as any,
        expiryDate
      };
      
      // Update flow state
      const existingIndex = this.flowState.documents.findIndex(
        doc => doc.documentType === documentType
      );
      
      if (existingIndex >= 0) {
        this.flowState.documents[existingIndex] = verificationDoc;
      } else {
        this.flowState.documents.push(verificationDoc);
      }
      
      this.updateFlowState();
      
      safeLog('log', `✅ Document upload completed: ${documentType}`);
      return verificationDoc;
    } catch (error) {
      safeLog('error', 'Error uploading document', error);
      throw error;
    }
  }

  /**
   * Submit all documents for review
   */
  async submitForReview(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Check if all required documents are uploaded
      const requiredTypes = this.getRequiredDocumentTypes();
      const uploadedTypes = this.flowState.documents.map(doc => doc.documentType);
      const missingTypes = requiredTypes.filter(type => !uploadedTypes.includes(type));
      
      if (missingTypes.length > 0) {
        return {
          success: false,
          message: `Please upload the following documents: ${missingTypes.join(', ')}`
        };
      }
      
      // Submit for review via API
      const result = await VerificationApiService.submitForReview(userId);
      
      if (result.success) {
        this.flowState.submittedForReview = true;
        this.flowState.verificationStatus = 'PENDING';
        this.flowState.canEdit = true; // Can still edit in PENDING status
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting for review:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(userId: string, documentType: string): Promise<void> {
    try {
      const document = this.flowState.documents.find(doc => doc.documentType === documentType);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete from Supabase Storage
      await SupabaseStorageService.deleteFile(document.filePath);
      
      // Delete from database
      if (document.id) {
        await VerificationApiService.deleteDocument(userId, document.id);
      }
      
      // Update flow state
      this.flowState.documents = this.flowState.documents.filter(
        doc => doc.documentType !== documentType
      );
      
      this.updateFlowState();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Get current flow state
   */
  getFlowState(): VerificationFlowState {
    return { ...this.flowState };
  }

  /**
   * Get required document types
   */
  getRequiredDocumentTypes(): string[] {
    return [
      'FACE_PHOTO',
      'NATIONAL_ID',
      'DRIVERS_LICENSE',
      'VEHICLE_REGISTRATION',
      'INSURANCE'
    ];
  }

  /**
   * Check if verification can be edited
   */
  canEditVerification(): boolean {
    return this.flowState.canEdit && this.flowState.verificationStatus !== 'APPROVED';
  }

  /**
   * Get verification status display info
   */
  getVerificationStatusDisplay(): {
    text: string;
    color: string;
    description: string;
  } {
    switch (this.flowState.verificationStatus) {
      case 'APPROVED':
        return {
          text: 'Verified',
          color: 'text-green-500',
          description: 'Your account has been verified successfully!'
        };
      case 'PENDING':
        return {
          text: 'Pending Review',
          color: 'text-yellow-500',
          description: 'Your documents are being reviewed by our team.'
        };
      case 'REJECTED':
        return {
          text: 'Rejected',
          color: 'text-red-500',
          description: 'Some documents were rejected. Please resubmit.'
        };
      default:
        return {
          text: 'Not Started',
          color: 'text-gray-500',
          description: 'Complete your verification to start earning.'
        };
    }
  }

  /**
   * Private method to update flow state
   */
  private updateFlowState(): void {
    const requiredTypes = this.getRequiredDocumentTypes();
    const uploadedTypes = this.flowState.documents.map(doc => doc.documentType);
    
    this.flowState.allUploaded = requiredTypes.every(type => uploadedTypes.includes(type));
  }

  /**
   * Reset flow state (useful for testing or user logout)
   */
  resetFlow(): void {
    this.flowState = {
      documents: [],
      allUploaded: false,
      submittedForReview: false,
      verificationStatus: null,
      canEdit: true
    };
  }
}

// Document type display names
export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  'FACE_PHOTO': 'Face Photo',
  'NATIONAL_ID': 'National ID',
  'DRIVERS_LICENSE': 'Driver\'s License',
  'VEHICLE_REGISTRATION': 'Vehicle Registration',
  'INSURANCE': 'Insurance Certificate'
};

// Document type descriptions
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  'FACE_PHOTO': 'Clear photo of your face for identity verification',
  'NATIONAL_ID': 'Front and back of your National Identity Card',
  'DRIVERS_LICENSE': 'Valid driver\'s license (front and back if applicable)',
  'VEHICLE_REGISTRATION': 'Vehicle registration certificate',
  'INSURANCE': 'Valid vehicle insurance certificate'
};
