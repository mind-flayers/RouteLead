import { useState, useEffect, useCallback } from 'react';
import { ProfilePictureService } from '@/services/profilePictureService';
import { supabase } from '@/lib/supabase';

interface UseProfilePhotoReturn {
  profilePhotoUrl: string | null;
  loading: boolean;
  error: string | null;
  refreshPhoto: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing profile photos from the database
 * Handles loading states, error handling, and automatic refresh capabilities
 */
export const useProfilePhoto = (userId: string | null): UseProfilePhotoReturn => {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfilePhoto = useCallback(async () => {
    if (!userId) {
      setProfilePhotoUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Validate userId format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid userId format:', userId);
      setProfilePhotoUrl(null);
      setLoading(false);
      setError('Invalid user ID format');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile photo URL from database using ProfilePictureService
      const photoUrl = await ProfilePictureService.getProfilePictureUrl(userId);
      setProfilePhotoUrl(photoUrl);
    } catch (err) {
      console.error('Error fetching profile photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile photo');
      setProfilePhotoUrl(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshPhoto = useCallback(async () => {
    await fetchProfilePhoto();
  }, [fetchProfilePhoto]);

  // Initial fetch
  useEffect(() => {
    fetchProfilePhoto();
  }, [fetchProfilePhoto]);

  // Note: Real-time subscriptions disabled to prevent multiple subscription errors
  // Profile photos don't change frequently, so manual refresh is sufficient
  // If real-time updates are needed in the future, implement a global subscription manager

  return {
    profilePhotoUrl,
    loading,
    error,
    refreshPhoto,
  };
};

/**
 * Hook specifically for getting the current user's profile photo
 * Automatically fetches the authenticated user's ID
 */
export const useCurrentUserProfilePhoto = (): UseProfilePhotoReturn => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting current user:', error);
          return;
        }
        setCurrentUserId(user?.id || null);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return useProfilePhoto(currentUserId);
};