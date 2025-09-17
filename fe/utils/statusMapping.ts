export type BackendDeliveryStatus = 'open' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export type FrontendDeliveryStatus = 'open' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export const mapBackendToFrontend = (backendStatus: BackendDeliveryStatus): FrontendDeliveryStatus => {
  return backendStatus;
};

export const mapFrontendToBackend = (frontendStatus: FrontendDeliveryStatus): BackendDeliveryStatus => {
  return frontendStatus;
};

export const isValidStatusTransition = (current: FrontendDeliveryStatus, next: FrontendDeliveryStatus): boolean => {
  const validTransitions: Record<FrontendDeliveryStatus, FrontendDeliveryStatus[]> = {
    'open': ['picked_up', 'cancelled'],
    'picked_up': ['in_transit', 'cancelled'],
    'in_transit': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
  };
  
  return validTransitions[current]?.includes(next) || current === next;
};

export const getNextStatus = (current: FrontendDeliveryStatus): FrontendDeliveryStatus | null => {
  const progressionMap: Record<FrontendDeliveryStatus, FrontendDeliveryStatus | null> = {
    'open': 'picked_up',
    'picked_up': 'in_transit',
    'in_transit': 'delivered',
    'delivered': null,
    'cancelled': null
  };
  
  return progressionMap[current] || null;
};

export const getStatusDisplayText = (status: FrontendDeliveryStatus): string => {
  const displayMap: Record<FrontendDeliveryStatus, string> = {
    'open': 'Open',
    'picked_up': 'Picked Up',
    'in_transit': 'In Transit',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  
  return displayMap[status] || status;
};

export const getNavigationDestination = (status: FrontendDeliveryStatus): 'pickup' | 'delivery' | null => {
  switch (status) {
    case 'open':
      return 'pickup'; // Before pickup, navigate to pickup location
    case 'picked_up':
    case 'in_transit':
      return 'delivery'; // After pickup, navigate to delivery location
    case 'delivered':
    case 'cancelled':
      return null; // No navigation needed for completed deliveries
    default:
      return 'pickup';
  }
};

export const getNavigationButtonText = (status: FrontendDeliveryStatus): string => {
  const destination = getNavigationDestination(status);
  
  switch (destination) {
    case 'pickup':
      return 'Navigate to Pickup';
    case 'delivery':
      return 'Navigate to Delivery';
    default:
      return 'Navigation Complete';
  }
};
