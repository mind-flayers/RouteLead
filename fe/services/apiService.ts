import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { reverseGeocode } from './geocodingService';
import { Config } from '@/constants/Config';

// Base configuration
// For React Native, we need to use the actual IP address instead of localhost
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access localhost
    // For physical Android device, use your machine's IP address
    return 'http://10.0.2.2:8080/api';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost should work
    return 'http://localhost:8080/api';
  } else {
    // For web/other platforms
    return 'http://localhost:8080/api';
  }
};

// Use actual IP address for all platforms to ensure connectivity
const API_BASE_URL = Config.API_BASE;

// Debug log to show which API URL is being used
console.log('API Base URL:', API_BASE_URL);

// Test function for debugging API connectivity
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/earnings/history?driverId=797c6f16-a06a-46b4-ae9f-9ded8aa4ab27`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    console.log('API Test Response status:', response.status);
    const data = await response.json();
    console.log('API Test Response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API Test Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Types for API responses
export interface EarningsSummary {
  driverId: string;
  todayEarnings: number;
  weeklyEarnings: number;
  availableBalance: number;
  pendingAmount: number;
  totalEarnings: number;
  pendingBidsCount: number;
}

export interface EarningsHistory {
  id: string;
  driverId: string;
  bidId: string;
  grossAmount: number;
  appFee: number;
  netAmount: number;
  status: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN';
  earnedAt: string;
  updatedAt?: string;
  customerName?: string;
  customerPhone?: string;
  routeDescription?: string;
  // API returns these as coordinates from routes table
  originLocation?: string;
  destinationLocation?: string;
  // Legacy fields for backward compatibility
  fromLocation?: string;
  toLocation?: string;
  fromLatitude?: number;
  fromLongitude?: number;
  toLatitude?: number;
  toLongitude?: number;
  // Additional fields from API response
  routeId?: string;
  offeredPrice?: number;
  parcelDescription?: string;
}

export interface PendingBid {
  id: string;
  routeId: string;
  customerId: string;
  customerName: string;
  fromLocation: string;
  toLocation: string;
  amount: number;
  status: string;
  createdAt: string;
}

// ==== DRIVER CHAT INTERFACES ====

export interface DriverConversation {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerProfileImage?: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bidId: string;
  routeDescription: string;
  deliveryStatus: string;
}

export interface AvailableCustomer {
  customerId: string;
  customerName: string;
  customerProfileImage?: string;
  customerPhone?: string;
  bidId: string;
  routeDescription: string;
  amount: number;
  createdAt: string;
  pickupLocation: string;
  deliveryLocation: string;
}

export interface PastCustomer {
  customerId: string;
  customerName: string;
  customerProfileImage?: string;
  customerPhone?: string;
  bidId: string;
  routeDescription: string;
  amount: number;
  completedAt: string;
  deliveryStatus: 'COMPLETED' | 'CANCELLED' | 'DELIVERED';
  pickupLocation: string;
  deliveryLocation: string;
  conversationId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

// Bid-related types
export interface BidDto {
  id: string;
  requestId: string;
  routeId: string;
  startIndex: number;
  endIndex: number;
  offeredPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  driverName?: string;
  vehicleInfo?: string;
  customerName?: string;
  isPaid?: boolean; // Payment status
  fromLocation?: string; // Route origin
  toLocation?: string; // Route destination
  estimatedTime?: string; // Estimated travel time
  estimatedPrice?: number; // Estimated route price
}

// Bid API functions
export const getBidById = async (bidId: string): Promise<BidDto> => {
  try {
    console.log('Fetching bid by ID:', bidId);
    const response = await fetch(`${API_BASE_URL}/bids/${bidId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bid data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bid by ID:', error);
    throw error;
  }
};

export const getAllBids = async (): Promise<BidDto[]> => {
  try {
    console.log('Fetching all bids');
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('All bids data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all bids:', error);
    throw error;
  }
};

// Get bids by customer ID (if your backend supports this)
export const getBidsByCustomerId = async (customerId: string): Promise<BidDto[]> => {
  try {
    console.log('Fetching bids for customer:', customerId);
    const response = await fetch(`${API_BASE_URL}/bids/customer/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Customer bids data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching customer bids:', error);
    throw error;
  }
};

// API utility functions
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  return response.json();
};

// Route interfaces
export interface MyRoute {
  id: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  departureTime: string;
  biddingStart?: string; // When bidding starts
  status: 'INITIATED' | 'OPEN' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  originLocationName?: string;
  destinationLocationName?: string;
  createdAt: string;
  biddingEndTime: string; // Calculated: 2 hours before departure
  bidCount: number;
  highestBidAmount?: number;
  // Additional fields from database
  detourToleranceKm?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  routePolyline?: string;
  totalDistanceKm?: number;
  estimatedDurationMinutes?: number;
}

export interface DetailedBid {
  id: string;
  requestId: string;
  routeId: string;
  offeredPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  
  // Customer details
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Parcel details
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  weightKg: number;
  volumeM3: number;
  description?: string;
  pickupLocationName?: string;
  dropoffLocationName?: string;
  
  // Bid details
  specialInstructions?: string;
  pickupTime?: string;
  deliveryTime?: string;
}

export interface ViewBidsResponse {
  routeId: string;
  routeOriginLat: number;
  routeOriginLng: number;
  routeDestinationLat: number;
  routeDestinationLng: number;
  routeOriginLocationName?: string;
  routeDestinationLocationName?: string;
  departureTime: string;
  biddingEndTime: string;
  isActive: boolean;
  bids: DetailedBid[];
  acceptedBids: DetailedBid[];
}

// API Service
export class ApiService {
  
  // Earnings API
  static async getEarningsSummary(driverId: string): Promise<EarningsSummary> {
    console.log(`Fetching earnings summary from: ${API_BASE_URL}/earnings/summary?driverId=${driverId}`);
    const response = await fetch(
      `${API_BASE_URL}/earnings/summary?driverId=${driverId}`,
      {
        method: 'GET',
        headers: await getAuthHeaders(),
      }
    );
    console.log('Earnings summary response status:', response.status);
    const json = await handleApiResponse(response);
    return json.data;
  }

  static async getEarningsHistory(
    driverId: string, 
    status?: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN'
  ): Promise<EarningsHistory[]> {
    let url = `${API_BASE_URL}/earnings/history?driverId=${driverId}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    console.log(`Fetching earnings history from: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    console.log('Earnings history response status:', response.status);
    const json = await handleApiResponse(response);
    return json.data || [];
  }

  static async updateEarningsStatus(earningsId: string, status: 'PENDING' | 'AVAILABLE' | 'WITHDRAWN'): Promise<EarningsHistory> {
    const response = await fetch(
      `${API_BASE_URL}/earnings/${earningsId}/status`,
      {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    const json = await handleApiResponse(response);
    return json.data;
  }

  // Bids API (mock for now)
  static async getPendingBids(driverId: string): Promise<PendingBid[]> {
    try {
      // This would be replaced with actual API call when bids endpoint is ready
      // const response = await fetch(`${API_BASE_URL}/bids/pending?driverId=${driverId}`, ...);
      
      // Mock data for now
      return [
        {
          id: 'bid-1',
          routeId: 'route-1',
          customerId: 'customer-1',
          customerName: 'Alice Johnson',
          fromLocation: 'Kandy',
          toLocation: 'Jaffna',
          amount: 1200.00,
          status: 'PENDING',
          createdAt: '2025-07-08T10:00:00Z',
        },
        {
          id: 'bid-2',
          routeId: 'route-2',
          customerId: 'customer-2',
          customerName: 'Bob Wilson',
          fromLocation: 'Galle',
          toLocation: 'Trincomalee',
          amount: 950.00,
          status: 'PENDING',
          createdAt: '2025-07-08T09:30:00Z',
        },
      ];
    } catch (error) {
      console.error('Error fetching pending bids:', error);
      return [];
    }
  }

  // Routes API
  static async getCompletedRoutesCount(driverId: string): Promise<number> {
    try {
      // For now, we'll return a mock count since we don't have the routes endpoint yet
      // When the routes API is ready, this would be:
      // const response = await fetch(`${API_BASE_URL}/routes/completed-count?driverId=${driverId}`, ...);
      
      // Mock data - return a realistic number based on the driver
      return 8; // Example: driver has completed 8 routes
    } catch (error) {
      console.error('Error fetching completed routes count:', error);
      return 0;
    }
  }

  // Route Creation API
  static async createRoute(routeData: any): Promise<{ routeId: string; message: string; priceSuggestion?: any }> {
    console.log('Creating route with data:', routeData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/routes`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(routeData),
      });

      console.log('Create route response status:', response.status);
      console.log('Create route response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to create route';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Failed to parse error JSON:', e);
          }
        } else {
          // If it's HTML or other content, read as text
          const errorText = await response.text();
          console.error('Server returned non-JSON error:', errorText);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Create route response:', result);
      
      return {
        routeId: result.routeId,
        message: result.message || 'Route created successfully',
        priceSuggestion: result.priceSuggestion
      };
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  static async getPriceSuggestion(routeId: string): Promise<any> {
    console.log('Fetching price suggestion for route:', routeId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/routes/price-suggestion?routeId=${routeId}`, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch price suggestion: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Price suggestion response:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching price suggestion:', error);
      throw error;
    }
  }

  static async validateRouteCoordinates(
    originLat: number, 
    originLng: number, 
    destinationLat: number, 
    destinationLng: number
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      // Basic Sri Lankan coordinate validation
      const isInSriLanka = (lat: number, lng: number) => {
        return lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9;
      };

      if (!isInSriLanka(originLat, originLng)) {
        return { valid: false, message: 'Origin location must be within Sri Lanka' };
      }

      if (!isInSriLanka(destinationLat, destinationLng)) {
        return { valid: false, message: 'Destination location must be within Sri Lanka' };
      }

      // Check minimum distance (e.g., at least 1km apart)
      const distance = this.calculateDistance(originLat, originLng, destinationLat, destinationLng);
      if (distance < 1) {
        return { valid: false, message: 'Origin and destination must be at least 1km apart' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating coordinates:', error);
      return { valid: false, message: 'Error validating coordinates' };
    }
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // MyRoutes API
  static async getMyRoutes(driverId: string, status?: string): Promise<MyRoute[]> {
    try {
      const statusParam = status ? `&status=${status}` : '';
      const response = await fetch(
        `${API_BASE_URL}/driver/routes?driverId=${driverId}${statusParam}`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.status}`);
      }

      const routes = await response.json();
      
      // Transform the response to match our MyRoute interface - removed slow async geocoding
      const transformedRoutes = routes.map((route: any) => {
        // Calculate bidding end time (2 hours before departure)
        const departureDate = new Date(route.departureTime);
        const biddingEndTime = new Date(departureDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
        
        // Use existing location names or show formatted coordinates (no API calls)
        const originLocationName = route.originLocationName || 
          formatLocationSync(`${route.originLat}, ${route.originLng}`);
        const destinationLocationName = route.destinationLocationName || 
          formatLocationSync(`${route.destinationLat}, ${route.destinationLng}`);

        return {
          id: route.id,
          originLat: route.originLat,
          originLng: route.originLng,
          destinationLat: route.destinationLat,
          destinationLng: route.destinationLng,
          departureTime: route.departureTime,
          biddingStart: route.biddingStart,
          status: route.status,
          originLocationName,
          destinationLocationName,
          createdAt: route.createdAt,
          biddingEndTime: biddingEndTime.toISOString(),
          bidCount: route.totalBidsCount || route.bidCount || 0,
          highestBidAmount: route.highestBidAmount,
          // Additional fields from database
          detourToleranceKm: route.detourToleranceKm,
          suggestedPriceMin: route.suggestedPriceMin,
          suggestedPriceMax: route.suggestedPriceMax,
          routePolyline: route.routePolyline,
          totalDistanceKm: route.totalDistanceKm,
          estimatedDurationMinutes: route.estimatedDurationMinutes,
        };
      });

      return transformedRoutes;
    } catch (error) {
      console.error('Error fetching my routes:', error);
      throw error;
    }
  }

  // Delete Route API
  static async deleteRoute(routeId: string, driverId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Deleting route ${routeId} for driver ${driverId}`);
      const response = await fetch(
        `${API_BASE_URL}/routes/${routeId}?driverId=${driverId}`,
        {
          method: 'DELETE',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete route: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('Delete route response:', result);
      
      return {
        success: true,
        message: result.message || 'Route deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  // Update Route API
  static async updateRoute(routeId: string, routeData: any): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Updating route ${routeId} with data:`, routeData);
      
      // Backend expects PATCH method with driverId as query parameter
      // and ReturnRouteUpdateRequestDto format - only send required fields
      const updateDto = {
        originLat: Number(routeData.originLat),
        originLng: Number(routeData.originLng),
        destinationLat: Number(routeData.destinationLat),
        destinationLng: Number(routeData.destinationLng),
        departureTime: routeData.departureTime,
        detourToleranceKm: Number(routeData.detourToleranceKm),
        suggestedPriceMin: Number(routeData.suggestedPriceMin),
        suggestedPriceMax: Number(routeData.suggestedPriceMax),
        status: 'OPEN' // Keep status as OPEN for active routes
      };
      
      console.log('Sending update DTO:', updateDto);
      
      const response = await fetch(
        `${API_BASE_URL}/routes/${routeId}?driverId=${routeData.driverId}`,
        {
          method: 'PATCH',
          headers: await getAuthHeaders(),
          body: JSON.stringify(updateDto),
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          errorMessage = `Failed to update route: ${response.status} - ${errorText}`;
        } catch (e) {
          errorMessage = `Failed to update route: ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Handle response carefully to avoid JSON parsing issues
      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        // Only try to parse as JSON if the response looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          result = JSON.parse(responseText);
        } else {
          // Handle plain text responses
          result = { message: responseText || 'Route updated successfully' };
        }
      } catch (jsonError) {
        console.warn('Failed to parse response as JSON, treating as success:', jsonError);
        // If JSON parsing fails but the HTTP status was OK, treat as success
        result = { message: 'Route updated successfully' };
      }
      
      console.log('Update route response:', result);
      
      return {
        success: true,
        message: result.message || 'Route updated successfully'
      };
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  // Get Route by ID API
  static async getRouteById(routeId: string): Promise<MyRoute> {
    try {
      console.log(`Fetching route ${routeId}`);
      const response = await fetch(
        `${API_BASE_URL}/routes/${routeId}`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${response.status}`);
      }

      const route = await response.json();
      
      // Calculate bidding end time (2 hours before departure)
      const departureDate = new Date(route.departureTime);
      const biddingEndTime = new Date(departureDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
      
      // Use existing location names or show formatted coordinates (no API calls for speed)
      const originLocationName = route.originLocationName || 
        formatLocationSync(`${route.originLat}, ${route.originLng}`);
      const destinationLocationName = route.destinationLocationName || 
        formatLocationSync(`${route.destinationLat}, ${route.destinationLng}`);

      return {
        id: route.id,
        originLat: route.originLat,
        originLng: route.originLng,
        destinationLat: route.destinationLat,
        destinationLng: route.destinationLng,
        departureTime: route.departureTime,
        biddingStart: route.biddingStart,
        status: route.status,
        originLocationName,
        destinationLocationName,
        createdAt: route.createdAt,
        biddingEndTime: biddingEndTime.toISOString(),
        bidCount: route.totalBidsCount || route.bidCount || 0,
        highestBidAmount: route.highestBidAmount,
        // Additional fields from database
        detourToleranceKm: route.detourToleranceKm,
        suggestedPriceMin: route.suggestedPriceMin,
        suggestedPriceMax: route.suggestedPriceMax,
        routePolyline: route.routePolyline,
        totalDistanceKm: route.totalDistanceKm,
        estimatedDurationMinutes: route.estimatedDurationMinutes,
      };
    } catch (error) {
      console.error('Error fetching route by ID:', error);
      throw error;
    }
  }

  // ViewBids API
  static async getViewBids(routeId: string, sort?: string, filter?: string): Promise<ViewBidsResponse> {
    try {
      const params = new URLSearchParams();
      // Add mock driver ID for now - in real app, get from auth context
      params.append('driverId', '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27');
      if (sort) params.append('sort', sort);
      if (filter) params.append('filter', filter);
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/driver/routes/${routeId}/view-bids?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching view bids:', error);
      throw error;
    }
  }

  // Bid Status Update API
  static async updateBidStatus(bidId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<DetailedBid> {
    try {
      const response = await fetch(
        `${API_BASE_URL.replace('/api', '')}/bids/${bidId}/status`,
        {
          method: 'PATCH',
          headers: await getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update bid status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating bid status:', error);
      throw error;
    }
  }

  // ==== DRIVER CHAT API METHODS ====

  // Get Driver Conversations API
  static async getDriverConversations(driverId: string): Promise<DriverConversation[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/driver/${driverId}/conversations`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get driver conversations: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract conversations array from response and map to interface format
      if (data.success && data.conversations) {
        return data.conversations.map((conv: any) => ({
          conversationId: conv.id,
          customerId: conv.customerId,
          customerName: conv.customerName,
          customerProfileImage: conv.customerPhoto,
          customerPhone: conv.customerPhone,
          lastMessage: conv.lastMessage || 'No messages yet',
          lastMessageTime: conv.lastMessageTime || conv.createdAt,
          unreadCount: conv.unreadCount || 0,
          bidId: conv.bidId,
          routeDescription: conv.requestDescription,
          deliveryStatus: 'active'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching driver conversations:', error);
      throw error;
    }
  }

  // Get Conversation by Bid ID API with access validation
  static async getConversationByBid(bidId: string): Promise<{
    conversation?: DriverConversation;
    accessDenied: boolean;
    reason?: string;
    message?: string;
    validationDetails?: {
      bidStatus: string;
      parcelStatus: string;
      paymentStatus: string;
    };
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/by-bid/${bidId}`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation by bid: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return {
          accessDenied: data.accessDenied || false,
          reason: data.reason,
          message: data.message,
          validationDetails: data.validationDetails
        };
      }

      return {
        conversation: data.conversation ? {
          conversationId: data.conversation.id,
          customerId: data.conversation.customerId,
          customerName: data.conversation.customerName,
          customerProfileImage: data.conversation.customerPhoto,
          customerPhone: data.conversation.customerPhone || '',
          lastMessage: '',
          lastMessageTime: data.conversation.lastMessageAt || data.conversation.createdAt,
          unreadCount: 0,
          bidId: data.conversation.bidId,
          routeDescription: '',
          deliveryStatus: 'active'
        } : undefined,
        accessDenied: false,
        validationDetails: data.validationDetails
      };
    } catch (error) {
      console.error('Error fetching conversation by bid:', error);
      throw error;
    }
  }

  // Get Available Customers API
  static async getAvailableCustomers(driverId: string): Promise<AvailableCustomer[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/driver/${driverId}/available-customers`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get available customers: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract customers array from response and map to interface format
      if (data.success && data.customers) {
        return data.customers.map((customer: any) => ({
          customerId: customer.customerId,
          customerName: customer.customerName,
          customerProfileImage: customer.customerPhoto,
          customerPhone: customer.customerPhone,
          bidId: customer.bidId,
          routeDescription: customer.requestDescription,
          amount: customer.offeredPrice || 0,
          createdAt: customer.createdAt,
          pickupLocation: customer.pickupLocation || 'N/A',
          deliveryLocation: customer.deliveryLocation || 'N/A'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching available customers:', error);
      throw error;
    }
  }

  // Get Past Customers API
  static async getPastCustomers(driverId: string): Promise<PastCustomer[]> {
    try {
      // Use earnings history to derive past customers from completed deliveries
      console.log('Fetching past customers from earnings history for driver:', driverId);
      
      // Get all earnings history for completed deliveries (AVAILABLE or WITHDRAWN status)
      const earningsHistory = await this.getEarningsHistory(driverId);
      
      if (!earningsHistory || earningsHistory.length === 0) {
        console.log('No earnings history found, returning mock past customers');
        return this.getMockPastCustomers();
      }

      // Filter for completed earnings (AVAILABLE or WITHDRAWN) and group by customer
      const completedEarnings = earningsHistory.filter(earning => 
        earning.status === 'AVAILABLE' || earning.status === 'WITHDRAWN'
      );

      // Group by customer name and bidId to avoid duplicates
      const customerMap = new Map<string, PastCustomer>();
      
      completedEarnings.forEach(earning => {
        const customerId = earning.bidId + '_customer'; // Generate customer ID from bid
        const customerKey = `${earning.customerName}_${earning.bidId}`;
        
        if (!customerMap.has(customerKey) && earning.customerName) {
          const pastCustomer: PastCustomer = {
            customerId: customerId,
            customerName: earning.customerName,
            customerProfileImage: undefined, // Not available in earnings
            customerPhone: earning.customerPhone || '',
            bidId: earning.bidId,
            routeDescription: earning.routeDescription || earning.parcelDescription || 'Package delivery',
            amount: earning.netAmount || earning.grossAmount,
            completedAt: earning.earnedAt,
            deliveryStatus: earning.status === 'WITHDRAWN' ? 'COMPLETED' : 'DELIVERED',
            pickupLocation: earning.fromLocation || earning.originLocation || 'Pickup location',
            deliveryLocation: earning.toLocation || earning.destinationLocation || 'Delivery location',
            conversationId: undefined // Not available in earnings
          };
          
          customerMap.set(customerKey, pastCustomer);
        }
      });

      const pastCustomers = Array.from(customerMap.values());
      
      // Sort by completion date (most recent first)
      pastCustomers.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      
      console.log(`Found ${pastCustomers.length} past customers from earnings history`);
      return pastCustomers;
      
    } catch (error) {
      console.error('Error fetching past customers from earnings:', error);
      
      // Fallback to mock data if earnings API fails
      console.log('Falling back to mock past customers data');
      return this.getMockPastCustomers();
    }
  }

  // Mock past customers for development/demo purposes
  private static getMockPastCustomers(): PastCustomer[] {
    return [
      {
        customerId: 'past_customer_1',
        customerName: 'Sarah Williams',
        customerProfileImage: undefined,
        customerPhone: '+94771234567',
        bidId: 'bid_completed_001',
        routeDescription: 'Colombo Fort → Mount Lavinia',
        amount: 850.00,
        completedAt: '2025-09-15T14:30:00Z',
        deliveryStatus: 'COMPLETED',
        pickupLocation: 'Colombo Fort Railway Station',
        deliveryLocation: 'Mount Lavinia Beach Hotel',
        conversationId: 'conv_001'
      },
      {
        customerId: 'past_customer_2',
        customerName: 'Rajesh Kumar',
        customerProfileImage: undefined,
        customerPhone: '+94779876543',
        bidId: 'bid_completed_002',
        routeDescription: 'Kandy → Nuwara Eliya',
        amount: 1200.00,
        completedAt: '2025-09-14T09:15:00Z',
        deliveryStatus: 'DELIVERED',
        pickupLocation: 'Kandy Bus Station',
        deliveryLocation: 'Nuwara Eliya Grand Hotel',
        conversationId: 'conv_002'
      },
      {
        customerId: 'past_customer_3',
        customerName: 'Priya Mendis',
        customerProfileImage: undefined,
        customerPhone: '+94776543210',
        bidId: 'bid_completed_003',
        routeDescription: 'Galle → Mirissa',
        amount: 650.00,
        completedAt: '2025-09-13T16:45:00Z',
        deliveryStatus: 'COMPLETED',
        pickupLocation: 'Galle Fort',
        deliveryLocation: 'Mirissa Beach Resort',
        conversationId: 'conv_003'
      }
    ];
  }

  // End Chat Session API
  static async endChatSession(conversationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/${conversationId}/end`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to end chat session: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw error;
    }
  }

  // Get Messages for Conversation API
  static async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/${conversationId}/messages`,
        {
          method: 'GET',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation messages: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  // Send Message API
  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    receiverId: string, 
    messageText: string
  ): Promise<{ success: boolean; message: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/${conversationId}/messages`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            senderId,
            receiverId,
            messageText
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create Conversation API
  static async createConversation(
    bidId: string, 
    customerId: string, 
    driverId: string
  ): Promise<{ success: boolean; conversationId: string; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/create`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            bidId,
            customerId,
            driverId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Mark Messages as Read API
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/${conversationId}/mark-read`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            userId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Mark Conversation as Read API
  static async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<{ success: boolean; unreadCount: number }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversation/${conversationId}/mark-conversation-read`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            userId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark conversation as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }
};

// Utility functions for formatting
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'LKR 0.00';
  }
  return `LKR ${amount.toFixed(2)}`;
};

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string for formatDate:', dateString);
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string for formatDateTime:', dateString);
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utility function to format location from coordinates or text
export const formatLocation = async (locationString: string | undefined | null): Promise<string> => {
  if (!locationString) return 'Unknown Location';
  
  // Check if it's coordinates in format "lat, lng"
  const coordMatch = locationString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    // Use direct import instead of dynamic import to avoid Metro bundling issues
    return reverseGeocode(lat, lng);
  }
  
  return locationString;
};

// Synchronous version for immediate display (shows better formatted coordinates first, then updates)
export const formatLocationSync = (locationString: string | undefined | null): string => {
  if (!locationString) return 'Unknown Location';
  
  // Check if it's coordinates in format "lat, lng"
  const coordMatch = locationString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    // Provide better immediate display for Sri Lankan coordinates
    if (lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9) {
      return `Location in Sri Lanka (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    }
    
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
  
  return locationString;
};

// Function to get route description from earnings history (synchronous version)
export const getRouteDescription = (earning: EarningsHistory): string => {
  // First priority: show pickup and dropoff locations
  const fromLoc = earning.fromLocation || earning.originLocation;
  const toLoc = earning.toLocation || earning.destinationLocation;
  
  if (fromLoc && toLoc) {
    return `${formatLocationSync(fromLoc)} → ${formatLocationSync(toLoc)}`;
  }
  
  // Second priority: route description if no locations
  if (earning.routeDescription) {
    return earning.routeDescription;
  }
  
  // Third priority: parcel description with customer info
  if (earning.parcelDescription && earning.customerName) {
    return `${earning.customerName}: ${earning.parcelDescription}`;
  }
  
  // Fourth priority: just parcel description
  if (earning.parcelDescription) {
    return `Delivery: ${earning.parcelDescription}`;
  }
  
  // Fallback: customer name or generic
  if (earning.customerName) {
    return `Delivery for ${earning.customerName}`;
  }
  
  return 'Package Delivery';
};

// Async version that resolves place names
export const getRouteDescriptionAsync = async (earning: EarningsHistory): Promise<string> => {
  // First priority: show pickup and dropoff locations
  const fromLoc = earning.fromLocation || earning.originLocation;
  const toLoc = earning.toLocation || earning.destinationLocation;
  
  if (fromLoc && toLoc) {
    const [fromPlace, toPlace] = await Promise.all([
      formatLocation(fromLoc),
      formatLocation(toLoc)
    ]);
    return `${fromPlace} → ${toPlace}`;
  }
  
  // Second priority: route description if no locations
  if (earning.routeDescription) {
    return earning.routeDescription;
  }
  
  // Third priority: parcel description with customer info
  if (earning.parcelDescription && earning.customerName) {
    return `${earning.customerName}: ${earning.parcelDescription}`;
  }
  
  // Fourth priority: just parcel description
  if (earning.parcelDescription) {
    return `Delivery: ${earning.parcelDescription}`;
  }
  
  // Fallback: customer name or generic
  if (earning.customerName) {
    return `Delivery for ${earning.customerName}`;
  }
  
  return 'Package Delivery';
};
