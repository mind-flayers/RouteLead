import { useState, useEffect } from 'react';
import { getRouteDescription, getRouteDescriptionAsync, EarningsHistory } from '@/services/apiService';

interface UseLocationDescriptionResult {
  description: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling location descriptions with geocoding
 * Shows immediate coordinates, then updates with place names
 */
export const useLocationDescription = (earning: EarningsHistory | null): UseLocationDescriptionResult => {
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!earning) {
      setDescription('');
      return;
    }

    // Set initial description (with coordinates)
    const initialDescription = getRouteDescription(earning);
    setDescription(initialDescription);

    // Check if we have coordinates to geocode
    const fromLoc = earning.fromLocation || earning.originLocation;
    const toLoc = earning.toLocation || earning.destinationLocation;
    
    const hasCoordinates = fromLoc && toLoc && 
      /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(fromLoc) &&
      /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(toLoc);

    if (hasCoordinates) {
      setIsLoading(true);
      setError(null);

      // Fetch geocoded description
      getRouteDescriptionAsync(earning)
        .then((geocodedDescription) => {
          setDescription(geocodedDescription);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to geocode location:', err);
          setError(err.message || 'Failed to load location names');
          setIsLoading(false);
          // Keep the initial description with coordinates
        });
    }
  }, [earning]);

  return {
    description,
    isLoading,
    error,
  };
};

/**
 * Batch hook for multiple earnings with geocoding
 */
export const useMultipleLocationDescriptions = (earnings: EarningsHistory[]): Array<UseLocationDescriptionResult> => {
  const [descriptions, setDescriptions] = useState<Array<UseLocationDescriptionResult>>([]);

  useEffect(() => {
    if (!earnings.length) {
      setDescriptions([]);
      return;
    }

    // Initialize with synchronous descriptions
    const initialDescriptions = earnings.map(earning => ({
      description: getRouteDescription(earning),
      isLoading: false,
      error: null,
    }));
    setDescriptions(initialDescriptions);

    // Process geocoding for items with coordinates
    const geocodingPromises = earnings.map(async (earning, index) => {
      const fromLoc = earning.fromLocation || earning.originLocation;
      const toLoc = earning.toLocation || earning.destinationLocation;
      
      const hasCoordinates = fromLoc && toLoc && 
        /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(fromLoc) &&
        /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(toLoc);

      if (hasCoordinates) {
        try {
          // Update loading state
          setDescriptions(prev => prev.map((desc, i) => 
            i === index ? { ...desc, isLoading: true } : desc
          ));

          const geocodedDescription = await getRouteDescriptionAsync(earning);
          
          // Update with geocoded result
          setDescriptions(prev => prev.map((desc, i) => 
            i === index ? { 
              description: geocodedDescription, 
              isLoading: false, 
              error: null 
            } : desc
          ));
        } catch (error) {
          console.error(`Failed to geocode location for earning ${earning.id}:`, error);
          
          // Update with error state but keep original description
          setDescriptions(prev => prev.map((desc, i) => 
            i === index ? { 
              ...desc, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Geocoding failed'
            } : desc
          ));
        }
      }
    });

    // Execute all geocoding operations
    Promise.allSettled(geocodingPromises);
  }, [earnings]);

  return descriptions;
};
