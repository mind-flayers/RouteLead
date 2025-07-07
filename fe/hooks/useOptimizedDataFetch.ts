import React, { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for optimized data fetching with caching
 */
export const useOptimizedDataFetch = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  cacheKey?: string
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simple in-memory cache
  const cache = new Map();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        const isExpired = Date.now() - cachedData.timestamp > 60000; // 1 minute cache
        
        if (!isExpired) {
          setData(cachedData.data);
          setLoading(false);
          return;
        }
      }

      const result = await fetchFunction();
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
