import { Config } from '@/constants/Config';

// Route-related types
export interface CreateRouteRequest {
  driverId: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  departureTime: string; // ISO string
  biddingStartTime?: string; // ISO string
  detourToleranceKm?: number;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  routePolyline: string;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  segments?: RouteSegmentRequest[];
}

export interface RouteSegmentRequest {
  segmentIndex: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distanceKm: number;
  locationName: string;
}

export interface CreateRouteResponse {
  routeId: string;
  message: string;
  status: string;
  segmentsCount: number;
}

// API Base URL
const API_BASE_URL = Config.API_BASE;

/**
 * Create a new route with segments
 */
export const createRoute = async (routeData: CreateRouteRequest): Promise<CreateRouteResponse> => {
  try {
    console.log('Creating route with data:', {
      ...routeData,
      segmentsCount: routeData.segments?.length || 0
    });

    const response = await fetch(`${API_BASE_URL}/routes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Route created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
};

/**
 * Get route details by ID
 */
export const getRouteDetails = async (routeId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
};

/**
 * Get routes for a specific driver
 */
export const getDriverRoutes = async (driverId: string, status?: string) => {
  try {
    const params = new URLSearchParams({ driverId });
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/driver/routes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching driver routes:', error);
    throw error;
  }
};

/**
 * Test API connection for route endpoints
 */
export const testRouteApiConnection = async () => {
  try {
    console.log('Testing Route API connection to:', API_BASE_URL);
    // Test with a simple GET request to check connectivity
    const response = await fetch(`${API_BASE_URL}/routes/mock/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Route API Test Response status:', response.status);
    const data = await response.json();
    console.log('Route API Test Response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Route API Test Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};
