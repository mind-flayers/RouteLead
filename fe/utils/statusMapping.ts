/**
 * Status mapping utilities for delivery management
 * Maps between frontend display statuses and backend database enum values
 */

// Backend database enum values (from DeliveryStatusEnum.java)
export type BackendDeliveryStatus = 'open' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

// Frontend display statuses  
export type FrontendDeliveryStatus = 'PENDING_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

/**
 * Maps backend status to frontend display status with robust handling
 * Handles both lowercase enum values and potential uppercase variants
 */
export const mapBackendToFrontend = (backendStatus: string | BackendDeliveryStatus): FrontendDeliveryStatus => {
  // Handle null/undefined cases
  if (!backendStatus) {
    return 'PENDING_PICKUP';
  }
  
  // Convert to lowercase for consistent comparison
  const normalizedStatus = backendStatus.toLowerCase();
  
  switch (normalizedStatus) {
    case 'open':
      return 'PENDING_PICKUP';
    case 'picked_up':
      return 'PICKED_UP';
    case 'in_transit':
      return 'IN_TRANSIT';
    case 'delivered':
      return 'DELIVERED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      console.warn('Unknown backend status:', backendStatus);
      return 'PENDING_PICKUP'; // Default fallback
  }
};

/**
 * Maps frontend status to backend status
 */
export const mapFrontendToBackend = (frontendStatus: FrontendDeliveryStatus): BackendDeliveryStatus => {
  switch (frontendStatus) {
    case 'PENDING_PICKUP':
      return 'open';
    case 'PICKED_UP':
      return 'picked_up';
    case 'IN_TRANSIT':
      return 'in_transit';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    default:
      console.warn('Unknown frontend status:', frontendStatus);
      return 'open'; // Default fallback
  }
};

/**
 * Get next valid status in the delivery flow
 */
export const getNextStatus = (currentStatus: FrontendDeliveryStatus): FrontendDeliveryStatus | null => {
  switch (currentStatus) {
    case 'PENDING_PICKUP':
      return 'PICKED_UP';
    case 'PICKED_UP':
      return 'IN_TRANSIT';
    case 'IN_TRANSIT':
      return 'DELIVERED';
    case 'DELIVERED':
    case 'CANCELLED':
      return null; // Final statuses
    default:
      return null;
  }
};

/**
 * Check if status transition is valid
 */
export const isValidStatusTransition = (
  from: FrontendDeliveryStatus, 
  to: FrontendDeliveryStatus
): boolean => {
  const validTransitions: Record<FrontendDeliveryStatus, FrontendDeliveryStatus[]> = {
    'PENDING_PICKUP': ['PICKED_UP'],
    'PICKED_UP': ['IN_TRANSIT'],
    'IN_TRANSIT': ['DELIVERED'],
    'DELIVERED': [], // Final status
    'CANCELLED': [] // Final status
  };

  return validTransitions[from]?.includes(to) || from === to;
};

/**
 * Get navigation destination based on current status
 */
export const getNavigationDestination = (status: FrontendDeliveryStatus): 'pickup' | 'delivery' | null => {
  switch (status) {
    case 'PENDING_PICKUP':
      return 'pickup';
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return 'delivery';
    case 'DELIVERED':
    case 'CANCELLED':
      return null; // No navigation needed
    default:
      return null;
  }
};

/**
 * Get user-friendly status display text
 */
export const getStatusDisplayText = (status: FrontendDeliveryStatus): string => {
  switch (status) {
    case 'PENDING_PICKUP':
      return 'Pending Pickup';
    case 'PICKED_UP':
      return 'Picked Up';
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Unknown Status';
  }
};

/**
 * Get navigation button text based on status
 */
export const getNavigationButtonText = (status: FrontendDeliveryStatus): string => {
  switch (status) {
    case 'PENDING_PICKUP':
      return '� Navigate to Pickup';
    case 'PICKED_UP':
      return '🎯 Navigate to Delivery';
    case 'IN_TRANSIT':
      return '📍 Continue to Delivery';
    case 'DELIVERED':
      return '✅ Delivery Complete';
    case 'CANCELLED':
      return '❌ Delivery Cancelled';
    default:
      return 'Start Navigation';
  }
};
