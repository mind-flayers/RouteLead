import { supabase } from '@/lib/supabase';
import { Config } from '@/constants/Config';

const API_BASE_URL = Config.API_BASE;

export interface VehicleData {
  driverId: string;
  color: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  plateNumber: string;
  maxWeightKg?: number;
  maxVolumeM3?: number;
  vehiclePhotos?: string[];
}

export interface VehicleResponse {
  id: number;
  color: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  plateNumber: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  vehiclePhotos: string[];
  createdAt: string;
  updatedAt: string;
}

export class VehicleApiService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log('🌐 Vehicle API Request:', endpoint);
      
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vehicle API Response Error:', response.status);
        console.error('Error message:', errorText);
        throw new Error(`Vehicle API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Vehicle API Request successful:', endpoint);
      return result;
    } catch (error) {
      console.error('💥 Vehicle API Request failed for', endpoint);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Create a new vehicle
  static async createVehicle(vehicleData: VehicleData): Promise<VehicleResponse> {
    return this.makeRequest<VehicleResponse>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // Get vehicles by driver ID
  static async getVehiclesByDriverId(driverId: string): Promise<VehicleResponse[]> {
    return this.makeRequest<VehicleResponse[]>(`/vehicles/driver/${driverId}`);
  }

  // Get vehicle by ID
  static async getVehicleById(vehicleId: number): Promise<VehicleResponse> {
    return this.makeRequest<VehicleResponse>(`/vehicles/${vehicleId}`);
  }

  // Update vehicle
  static async updateVehicle(vehicleId: number, vehicleData: Partial<VehicleData>): Promise<VehicleResponse> {
    return this.makeRequest<VehicleResponse>(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // Delete vehicle
  static async deleteVehicle(vehicleId: number): Promise<void> {
    return this.makeRequest<void>(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }
}
