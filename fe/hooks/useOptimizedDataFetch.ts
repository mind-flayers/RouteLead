import React, { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '../lib/cache';

interface DataFetchOptions {
  cacheDuration?: 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG' | 'PERSISTENT';
  persistentCache?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Enhanced custom hook for optimized data fetching with comprehensive caching
 */
export const useOptimizedDataFetch = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  cacheKey?: string,
  options: DataFetchOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    cacheDuration = 'MEDIUM',
    persistentCache = true,
    retryCount: maxRetries = 3,
    retryDelay = 1000
  } = options;

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (cacheKey && !forceRefresh) {
        const cachedData = await cacheManager.get<T>(cacheKey, persistentCache);
        if (cachedData !== null) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const result = await fetchFunction();
      
      // Cache the result
      if (cacheKey) {
        await cacheManager.set(cacheKey, result, cacheDuration, persistentCache);
      }

      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err as Error);
      
      // Implement retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData(forceRefresh);
        }, retryDelay * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [...dependencies, retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const refresh = useCallback(() => fetchData(false), [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch, // Force refresh (ignores cache)
    refresh, // Refresh if cache expired
    retryCount 
  };
};

/**
 * Hook specifically for API calls with endpoint-based caching
 */
export const useApiCall = <T>(
  endpoint: string,
  fetchFunction: () => Promise<T>,
  params: Record<string, any> = {},
  options: DataFetchOptions = {}
) => {
  const cacheKey = `api_${endpoint}_${JSON.stringify(params)}`;
  
  return useOptimizedDataFetch<T>(
    fetchFunction,
    [endpoint, JSON.stringify(params)],
    cacheKey,
    {
      cacheDuration: 'MEDIUM',
      persistentCache: true,
      ...options
    }
  );
};

/**
 * Hook for user-specific data caching
 */
export const useUserDataFetch = <T>(
  userId: string,
  dataType: string,
  fetchFunction: () => Promise<T>,
  options: DataFetchOptions = {}
) => {
  const cacheKey = `user_${userId}_${dataType}`;
  
  return useOptimizedDataFetch<T>(
    fetchFunction,
    [userId, dataType],
    cacheKey,
    {
      cacheDuration: 'LONG',
      persistentCache: true,
      ...options
    }
  );
};
