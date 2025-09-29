import { useState, useEffect } from 'react';
import { ApiService, MyRoute } from '@/services/apiService';

export const useMyRoutes = (driverId: string, status?: string) => {
  const [routes, setRoutes] = useState<MyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoutes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // **PERFORMANCE OPTIMIZATION**: Use caching by default, skip cache only on manual refresh
      const useCache = !isRefresh;
      const data = await ApiService.getMyRoutes(driverId, status, useCache);
      setRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (driverId) {
      fetchRoutes();
    }
  }, [driverId, status]);

  const refresh = () => fetchRoutes(true);

  return {
    routes,
    loading,
    error,
    refreshing,
    refresh,
  };
};
