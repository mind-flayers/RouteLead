import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService, MyRoute } from '@/services/apiService';

export const useMyRoutes = (driverId: string, status?: string) => {
  const [routes, setRoutes] = useState<MyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add refs for interval management like useAutomaticBidding
  const intervalRef = useRef<any>(null);

  const fetchRoutes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await ApiService.getMyRoutes(driverId, status);
      setRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId, status]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchRoutes(true);
  }, [fetchRoutes]);

  // Initial data fetch
  useEffect(() => {
    if (driverId) {
      fetchRoutes();
    }
  }, [driverId, fetchRoutes]);

  // Set up auto-refresh interval (every 30 seconds) like useAutomaticBidding
  useEffect(() => {
    if (driverId) {
      intervalRef.current = setInterval(() => {
        fetchRoutes(true);
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [driverId, fetchRoutes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    routes,
    loading,
    error,
    refreshing,
    refresh,
  };
};