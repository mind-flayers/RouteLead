import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { VerificationStatus } from '@/lib/types';

export interface VerificationGuardResult {
  isVerified: boolean;
  verificationStatus: VerificationStatus | undefined;
  isDriver: boolean;
  canAccessRestrictedFeatures: boolean;
  verificationMessage: string;
}

/**
 * Optimized verification guard hook that only refreshes on page focus/mount
 * instead of on every render. This reduces unnecessary API calls and improves performance.
 */
export function useVerificationGuardOptimized(shouldRefreshOnFocus = true): VerificationGuardResult {
  const { user, isDriver, isDriverVerified, refreshUserProfile } = useAuth();

  // Auto-refresh verification status when screen comes into focus
  // This ensures fresh data when user navigates to a page, but doesn't poll continuously
  useFocusEffect(
    useCallback(() => {
      if (shouldRefreshOnFocus && isDriver()) {
        console.log('🔄 VerificationGuard: Refreshing on page focus');
        refreshUserProfile().catch(error => {
          console.error('❌ VerificationGuard: Failed to refresh profile:', error);
        });
      }
    }, [shouldRefreshOnFocus, isDriver, refreshUserProfile])
  );

  // Memoize the verification calculations to prevent unnecessary recalculations
  const verificationData = useMemo(() => {
    const verificationStatus = user?.verificationStatus;
    const isVerified = isDriverVerified();
    const canAccessRestrictedFeatures = isVerified;
    const driverStatus = isDriver();

    // Debug logging (only when values change due to memoization)
    console.log('🛡️ VerificationGuard Optimized Debug:', {
      isDriver: driverStatus,
      verificationStatus,
      isVerified,
      canAccessRestrictedFeatures,
      userRole: user?.role,
      userId: user?.id
    });

    let verificationMessage = '';
    
    if (driverStatus) {
      switch (verificationStatus) {
        case VerificationStatus.PENDING:
          verificationMessage = 'Your verification is pending. You can explore the app but cannot access earnings, routes, or chats until verified.';
          break;
        case VerificationStatus.REJECTED:
          verificationMessage = 'Your verification was rejected. Please contact support or resubmit your documents.';
          break;
        case VerificationStatus.APPROVED:
          verificationMessage = 'You are verified and have full access to all features.';
          break;
        default:
          verificationMessage = 'Please complete your verification to access all features.';
      }
    }

    return {
      isVerified,
      verificationStatus,
      isDriver: driverStatus,
      canAccessRestrictedFeatures,
      verificationMessage,
    };
  }, [user, isDriver, isDriverVerified]);

  return verificationData;
}

/**
 * Lightweight version for components that only need basic verification status
 * without automatic refresh (e.g., for icon styling in navigation)
 */
export function useVerificationStatusLite(): Pick<VerificationGuardResult, 'canAccessRestrictedFeatures' | 'isDriver'> {
  const { isDriver, isDriverVerified } = useAuth();
  
  return useMemo(() => ({
    isDriver: isDriver(),
    canAccessRestrictedFeatures: isDriverVerified(),
  }), [isDriver, isDriverVerified]);
}