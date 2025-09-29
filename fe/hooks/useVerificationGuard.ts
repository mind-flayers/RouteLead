import { useMemo } from 'react';
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
 * @deprecated Use useVerificationGuardOptimized for better performance
 * This hook will be removed in a future version
 */
export function useVerificationGuard(): VerificationGuardResult {
  const { user, isDriver, isDriverVerified } = useAuth();

  // Memoize calculations to prevent unnecessary recalculations
  return useMemo(() => {
    const verificationStatus = user?.verificationStatus;
    const isVerified = isDriverVerified();
    const canAccessRestrictedFeatures = isVerified;
    const driverStatus = isDriver();

    // Debug logging (only when values change due to memoization)
    console.log('🛡️ VerificationGuard Debug (Legacy):', {
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
}
