import { SupabaseStorageService, FileUploadResult } from './supabaseStorageService';
import { supabase } from '@/lib/supabase';

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

export class ProfilePictureService {
  /**
   * Upload profile picture and update user profile
   */
  static async uploadProfilePicture(
    userId: string,
    file: { uri: string; type: string; name: string }
  ): Promise<string> {
    try {
      safeLog('log', '📤 Starting profile picture upload...');
      
      // Upload to Supabase Storage using the same path structure as verification documents
      const uploadResult: FileUploadResult = await SupabaseStorageService.uploadFile(
        file,
        userId,
        'PROFILE_PHOTO'
      );
      
      safeLog('log', '💾 Updating profile with photo URL...');
      
      // Update user profile with the new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: uploadResult.fullUrl })
        .eq('id', userId);

      if (updateError) {
        safeLog('error', 'Database update error', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      safeLog('log', '✅ Profile picture uploaded and saved successfully');
      return uploadResult.fullUrl;
      
    } catch (error) {
      safeLog('error', 'Error uploading profile picture', error);
      throw error;
    }
  }
  
  /**
   * Get current profile picture URL from database
   */
  static async getProfilePictureUrl(userId: string): Promise<string | null> {
    try {
      safeLog('log', '📥 Fetching profile picture URL...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_photo_url')
        .eq('id', userId)
        .single();

      if (error) {
        safeLog('error', 'Error fetching profile picture', error);
        return null;
      }
      
      return data?.profile_photo_url || null;
      
    } catch (error) {
      safeLog('error', 'Error getting profile picture URL', error);
      return null;
    }
  }
  
  /**
   * Delete profile picture from storage and database
   */
  static async deleteProfilePicture(userId: string): Promise<void> {
    try {
      safeLog('log', '🗑️ Deleting profile picture...');
      
      // Get current profile picture URL to determine file path
      const currentUrl = await this.getProfilePictureUrl(userId);
      
      if (currentUrl) {
        // Extract file path from URL to delete from storage
        // URL format: https://...supabase.co/storage/v1/object/public/verification-documents/documents/userId/PROFILE_PHOTO/filename
        const urlParts = currentUrl.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'documents');
        if (pathIndex !== -1) {
          const filePath = urlParts.slice(pathIndex).join('/');
          await SupabaseStorageService.deleteFile(filePath);
        }
      }
      
      // Clear profile_photo_url in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', userId);

      if (updateError) {
        safeLog('error', 'Database update error', updateError);
        throw new Error(`Failed to clear profile picture: ${updateError.message}`);
      }
      
      safeLog('log', '✅ Profile picture deleted successfully');
      
    } catch (error) {
      safeLog('error', 'Error deleting profile picture', error);
      throw error;
    }
  }
}
