import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface RouteData {
  polyline: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  encoded_polyline: string;
}

export interface RouteCreationData {
  origin?: LocationData;
  destination?: LocationData;
  selectedRoute?: RouteData;
  departureTime?: Date;
  biddingStartTime?: Date; // New field for bidding start time
  detourToleranceKm?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  // Additional fields that may be collected in other steps
  vehicleCapacity?: {
    maxWeight: number;
    maxVolume: number;
  };
  notes?: string;
}

interface RouteCreationContextType {
  routeData: RouteCreationData;
  updateRouteData: (data: Partial<RouteCreationData>) => void;
  clearRouteData: () => void;
  isLocationDataComplete: () => boolean;
  isRouteDataComplete: () => boolean;
  isFullRouteDataComplete: () => boolean; // New function for API call validation
  getCreateRoutePayload: (driverId: string) => any;
}

const RouteCreationContext = createContext<RouteCreationContextType | undefined>(undefined);

interface RouteCreationProviderProps {
  children: ReactNode;
}

export const RouteCreationProvider: React.FC<RouteCreationProviderProps> = ({ children }) => {
  const [routeData, setRouteData] = useState<RouteCreationData>({});

  const updateRouteData = (data: Partial<RouteCreationData>) => {
    setRouteData(prev => ({ ...prev, ...data }));
  };

  const clearRouteData = () => {
    setRouteData({});
  };

  const isLocationDataComplete = () => {
    return !!(routeData.origin && routeData.destination);
  };

  const isRouteDataComplete = () => {
    const hasBasicData = !!(
      routeData.origin &&
      routeData.destination &&
      routeData.selectedRoute &&
      routeData.suggestedPriceMin !== undefined &&
      routeData.suggestedPriceMax !== undefined
    );
    
    // For backward compatibility, allow routes without bidding start time
    // (can be set later in the form)
    return hasBasicData;
  };

  const isFullRouteDataComplete = () => {
    return !!(
      routeData.origin &&
      routeData.destination &&
      routeData.selectedRoute &&
      routeData.departureTime &&
      routeData.biddingStartTime &&
      routeData.suggestedPriceMin !== undefined &&
      routeData.suggestedPriceMax !== undefined
    );
  };

  const getCreateRoutePayload = (driverId: string) => {
    if (!isFullRouteDataComplete()) {
      throw new Error('Route data is incomplete');
    }

    return {
      driverId,
      originLat: routeData.origin!.lat,
      originLng: routeData.origin!.lng,
      destinationLat: routeData.destination!.lat,
      destinationLng: routeData.destination!.lng,
      departureTime: routeData.departureTime!.toISOString(),
      biddingStartTime: routeData.biddingStartTime!.toISOString(),
      detourToleranceKm: routeData.detourToleranceKm || 5.0,
      suggestedPriceMin: routeData.suggestedPriceMin!,
      suggestedPriceMax: routeData.suggestedPriceMax!,
      // Enhanced fields for polyline support
      routePolyline: routeData.selectedRoute!.encoded_polyline,
      totalDistanceKm: routeData.selectedRoute!.distance,
      estimatedDurationMinutes: Math.round(routeData.selectedRoute!.duration),
    };
  };

  const value: RouteCreationContextType = {
    routeData,
    updateRouteData,
    clearRouteData,
    isLocationDataComplete,
    isRouteDataComplete,
    isFullRouteDataComplete,
    getCreateRoutePayload,
  };

  return (
    <RouteCreationContext.Provider value={value}>
      {children}
    </RouteCreationContext.Provider>
  );
};

export const useRouteCreation = (): RouteCreationContextType => {
  const context = useContext(RouteCreationContext);
  if (context === undefined) {
    throw new Error('useRouteCreation must be used within a RouteCreationProvider');
  }
  return context;
};
