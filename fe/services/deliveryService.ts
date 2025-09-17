import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Config } from '@/constants/Config';
import { 
  BackendDeliveryStatus, 
  FrontendDeliveryStatus,
  mapBackendToFrontend,
  mapFrontendToBackend 
} from '../utils/statusMapping';

// Use the same API base URL pattern as apiService
const API_BASE_URL = Config.API_BASE;

// Helper function to make authenticated API calls
const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    console.log(`🔗 Making API call to: ${API_BASE_URL}${endpoint}`);
    console.log(`📋 Headers:`, headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, response.headers);

    if (!response.ok) {
      // Try to get detailed error information
      let errorDetails = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error(`❌ Error response body:`, errorText);
        
        // Try to parse JSON error
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorDetails = errorJson.message;
          } else if (errorJson.error) {
            errorDetails = errorJson.error;
          }
        } catch (parseError) {
          // If parsing fails, use the raw text
          if (errorText.length > 0) {
            errorDetails = errorText.substring(0, 200); // Limit error message length
          }
        }
      } catch (readError) {
        console.error(`❌ Failed to read error response:`, readError);
      }
      
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log(`✅ API response success:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export interface DeliveryDetails {
  deliveryTrackingId: string;
  bidId: string;
  customerId: string;
  driverId: string;
  
  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Bid details
  bidAmount: number;
  status: FrontendDeliveryStatus; // Use frontend status type
  estimatedArrival: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  
  // Parcel details
  description: string;
  weightKg: number;
  volumeM3: number;
  specialInstructions?: string;
  
  // Location details
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  
  // Current location
  currentLat?: number;
  currentLng?: number;
  lastLocationUpdate?: string;
  
  // Contact details
  pickupContactName: string;
  pickupContactPhone: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  
  // Status
  paymentCompleted: boolean;
  parcelPhotos?: string; // JSON string of photo URLs
}

export interface DeliveryStatusUpdate {
  status: BackendDeliveryStatus; // Use backend status type that gets sent to API
  currentLat?: number;
  currentLng?: number;
  notes?: string;
}

export interface DeliverySummary {
  deliveryTrackingId: string;
  bidId: string;
  customerName: string;
  bidAmount: number;
  driverName: string;
  deliveryStartedAt: string;
  deliveryCompletedAt: string;
  totalDeliveryTimeMinutes: number;
  
  // Locations
  pickupAddress: string;
  dropoffAddress: string;
  
  // Parcel info
  parcelDescription: string;
  weightKg: number;
  volumeM3: number;
  
  // Statistics
  totalLocationUpdates?: number;
}

class DeliveryService {
  
  /**
   * Get comprehensive delivery details for a bid
   */
  async getDeliveryDetails(bidId: string): Promise<DeliveryDetails> {
    try {
      const data = await makeApiCall(`/delivery/${bidId}/details`);
      
      // Map backend status to frontend status with robust handling
      if (data.status) {
        data.status = mapBackendToFrontend(data.status);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching delivery details:', error);
      throw new Error('Failed to fetch delivery details');
    }
  }
  
  /**
   * Update delivery status and location
   */
  async updateDeliveryStatus(bidId: string, update: DeliveryStatusUpdate): Promise<DeliveryDetails> {
    try {
      // Map frontend status to backend status if needed
      let backendStatus = update.status;
      if (typeof update.status === 'string') {
        // Handle case where frontend passes string status
        switch (update.status.toLowerCase()) {
          case 'pending_pickup':
            backendStatus = 'open';
            break;
          case 'picked_up':
            backendStatus = 'picked_up';
            break;
          case 'in_transit':
            backendStatus = 'in_transit';
            break;
          case 'delivered':
            backendStatus = 'delivered';
            break;
          case 'cancelled':
            backendStatus = 'cancelled';
            break;
          default:
            backendStatus = update.status;
        }
      }

      // Create the API payload with backend status
      const apiPayload = {
        status: backendStatus,
        currentLat: update.currentLat,
        currentLng: update.currentLng,
        notes: update.notes
      };

      console.log('🔄 Updating delivery status:', {
        bidId,
        frontendStatus: update.status,
        backendStatus,
        payload: apiPayload
      });

      const data = await makeApiCall(`/delivery/${bidId}/status`, {
        method: 'PUT',
        body: JSON.stringify(apiPayload),
      });
      
      // Map backend status back to frontend status with robust handling
      if (data.status) {
        data.status = mapBackendToFrontend(data.status);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw new Error('Failed to update delivery status');
    }
  }
  
  /**
   * Complete delivery and get summary
   */
  async completeDelivery(bidId: string, finalUpdate: DeliveryStatusUpdate): Promise<DeliverySummary> {
    try {
      // Status is already in backend format, no conversion needed
      const data = await makeApiCall(`/delivery/${bidId}/complete`, {
        method: 'POST',
        body: JSON.stringify(finalUpdate),
      });
      return data;
    } catch (error) {
      console.error('Error completing delivery:', error);
      throw new Error('Failed to complete delivery');
    }
  }
  
  /**
   * Get delivery tracking status (alternative endpoint)
   */
  async getDeliveryTracking(bidId: string): Promise<DeliveryDetails> {
    try {
      const data = await makeApiCall(`/delivery/${bidId}/tracking`);
      
      // Map backend status to frontend status
      if (data.status) {
        data.status = mapBackendToFrontend(data.status as BackendDeliveryStatus);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching delivery tracking:', error);
      throw new Error('Failed to fetch delivery tracking');
    }
  }
}

export const deliveryService = new DeliveryService();
export default deliveryService;
