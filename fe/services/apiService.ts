import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base configuration
// For React Native, we need to use the actual IP address instead of localhost
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access localhost on the host machine
    // For physical Android device, use your machine's actual IP address
    return 'http://10.0.2.2:8080/api';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost should work
    // For physical iOS device, use your machine's IP address
    return 'http://localhost:8080/api';
  } else {
    // For web/other platforms
    return 'http://localhost:8080/api';
  }
};

// Use actual IP address for all platforms to ensure connectivity
const API_BASE_URL = 'https://beb55805c130.ngrok-free.app/api';

// Debug log to show which API URL is being used
console.log('API Base URL:', API_BASE_URL);

// Test function for debugging API connectivity
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/earnings/summary?driverId=797c6f16-a06a-46b4-ae9f-9ded8aa4ab27`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
  updatedAt: string;
  customerName?: string;
  customerPhone?: string;
  routeDescription?: string;
  fromLocation?: string;
  toLocation?: string;
  fromLatitude?: number;
  fromLongitude?: number;
  toLatitude?: number;
  toLongitude?: number;
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
