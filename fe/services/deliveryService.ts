import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Config } from '@/constants/Config';

// Use the same API base URL pattern as apiService
const API_BASE_URL = Config.API_BASE;

// Helper function to make authenticated API calls
const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export interface DeliveryDetails {
  deliveryTrackingId: string;
  bidId: string;
  driverId: string;
  driverName: string;
  customerName: string;
  customerPhone: string;
  bidAmount: number;
  status: 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  estimatedArrival: string;
  actualDeliveryTime?: string;
  
  // Parcel details
  description: string;
  weightKg: number;
  volumeM3: number;
  specialInstructions: string;
  
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
  
  // Contact details
  pickupContactName: string;
  pickupContactPhone: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  
  // Status
  paymentCompleted: boolean;
}

export interface DeliveryStatusUpdate {
  status: 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  currentLat?: number;
  currentLng?: number;
  notes?: string;
}

export interface DeliverySummary {
  deliveryTrackingId: string;
  customerName: string;
  bidAmount: number;
  driverName: string;
  deliveryCompletedAt: string;
  totalDeliveryTimeMinutes: number;
  
  // Locations
  pickupAddress: string;
  dropoffAddress: string;
  
  // Parcel info
  parcelDescription: string;
  weightKg: number;
}

class DeliveryService {
  
  /**
   * Get comprehensive delivery details for a bid
   */
  async getDeliveryDetails(bidId: string): Promise<DeliveryDetails> {
    try {
      const data = await makeApiCall(`/delivery/${bidId}/details`);
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
      const data = await makeApiCall(`/delivery/${bidId}/status`, {
        method: 'PUT',
        body: JSON.stringify(update),
      });
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
      return data;
    } catch (error) {
      console.error('Error fetching delivery tracking:', error);
      throw new Error('Failed to fetch delivery tracking');
    }
  }
}

export const deliveryService = new DeliveryService();
export default deliveryService;
