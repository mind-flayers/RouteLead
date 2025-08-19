import { cacheManager } from '@/lib/cache';
import { cacheUtils } from './cacheService';
import { Config } from '@/constants/Config';

// Interface for route details data
export interface RouteDetailsData {
  id: string;
  originAddress: string;
  destinationAddress: string;
  status: string;
  departureTime: string;
  totalBids: number;
  highestBid: string;
  driverName?: string;
  driverRating?: number;
  driverReviewCount?: number;
  totalDistance?: string;
  estimatedDuration?: string;
  routeImage?: string;
  routeTags?: string[];
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  biddingEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cache keys
const ROUTE_DETAILS_CACHE_PREFIX = 'route_details_';
const ROUTE_DETAILS_API_ENDPOINT = 'routes/details';

/**
 * Service for managing route details data with caching
 */
export class RouteDetailsService {
  
  /**
   * Fetch route details from API and cache them
   */
  static async fetchRouteDetails(routeId: string): Promise<RouteDetailsData> {
    try {
      console.log(`Fetching route details for route: ${routeId}`);
      
      const response = await fetch(`${Config.API_BASE}/routes/${routeId}/details`);

      if (!response.ok) {
        throw new Error(`Failed to fetch route details: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our interface
      const transformedData: RouteDetailsData = {
        id: data.id || routeId,
        originAddress: data.originAddress || data.originLocationName || 'Unknown Origin',
        destinationAddress: data.destinationAddress || data.destinationLocationName || 'Unknown Destination',
        status: data.status || 'UNKNOWN',
        departureTime: data.departureTime || new Date().toISOString(),
        totalBids: data.totalBids || 0,
        highestBid: data.highestBid || 'LKR 0.00',
        driverName: data.driverName,
        driverRating: data.driverRating,
        driverReviewCount: data.driverReviewCount,
        totalDistance: data.totalDistance,
        estimatedDuration: data.estimatedDuration,
        routeImage: data.routeImage,
        routeTags: data.routeTags,
        originLat: data.originLat,
        originLng: data.originLng,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        biddingEndTime: data.biddingEndTime,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      // Save to cache
      await this.saveRouteDetailsToCache(routeId, transformedData);
      
      console.log(`Route details fetched and cached for route ${routeId}`);
      return transformedData;
    } catch (error) {
      console.error(`Error fetching route details for ${routeId}:`, error);
      throw error;
    }
  }

  /**
   * Get route details from cache or fetch from API
   */
  static async getRouteDetails(routeId: string, forceRefresh: boolean = false): Promise<RouteDetailsData | null> {
    try {
      // If not forcing refresh, try to get from cache first
      if (!forceRefresh) {
        const cachedData = await this.getCachedRouteDetails(routeId);
        if (cachedData) {
          console.log(`Using cached route details for route ${routeId}`);
          return cachedData;
        }
      }

      // Fetch from API if no cache or force refresh
      return await this.fetchRouteDetails(routeId);
    } catch (error) {
      console.error(`Error getting route details for ${routeId}:`, error);
      
      // If API fails, try to get from cache as fallback
      if (forceRefresh) {
        const cachedData = await this.getCachedRouteDetails(routeId);
        if (cachedData) {
          console.log(`Using cached route details as fallback for route ${routeId}`);
          return cachedData;
        }
      }
      
      throw error;
    }
  }

  /**
   * Save route details to cache
   */
  static async saveRouteDetailsToCache(routeId: string, data: RouteDetailsData): Promise<void> {
    try {
      const cacheKey = `${ROUTE_DETAILS_CACHE_PREFIX}${routeId}`;
      
      // Cache for 30 minutes (MEDIUM duration)
      await cacheManager.set(cacheKey, data, 'MEDIUM', true);
      
      // Also cache as API response for consistency
      await cacheUtils.cacheApiResponse(`${ROUTE_DETAILS_API_ENDPOINT}/${routeId}`, data, { routeId });
      
      console.log(`Route details cached for route ${routeId}`);
    } catch (error) {
      console.warn(`Failed to cache route details for ${routeId}:`, error);
    }
  }

  /**
   * Get cached route details
   */
  static async getCachedRouteDetails(routeId: string): Promise<RouteDetailsData | null> {
    try {
      const cacheKey = `${ROUTE_DETAILS_CACHE_PREFIX}${routeId}`;
      
      // Try to get from cache manager first
      const cachedData = await cacheManager.get<RouteDetailsData>(cacheKey, true);
      if (cachedData) {
        return cachedData;
      }
      
      // Try to get from API cache
      const apiCachedData = await cacheUtils.getCachedApiResponse<RouteDetailsData>(
        `${ROUTE_DETAILS_API_ENDPOINT}/${routeId}`, 
        { routeId }
      );
      if (apiCachedData) {
        return apiCachedData;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get cached route details for ${routeId}:`, error);
      return null;
    }
  }

  /**
   * Clear cached route details
   */
  static async clearCachedRouteDetails(routeId: string): Promise<void> {
    try {
      const cacheKey = `${ROUTE_DETAILS_CACHE_PREFIX}${routeId}`;
      await cacheManager.remove(cacheKey);
      console.log(`Cached route details cleared for route ${routeId}`);
    } catch (error) {
      console.error(`Failed to clear cached route details for ${routeId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cached route details
   */
  static async clearAllCachedRouteDetails(): Promise<void> {
    try {
      // Get all cache keys and remove route details ones
      const keys = await cacheManager.getAllKeys();
      const routeDetailKeys = keys.filter(key => key.startsWith(ROUTE_DETAILS_CACHE_PREFIX));
      
      for (const key of routeDetailKeys) {
        await cacheManager.remove(key);
      }
      
      console.log(`Cleared ${routeDetailKeys.length} cached route details`);
    } catch (error) {
      console.error('Failed to clear all cached route details:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for route details
   */
  static async getRouteDetailsCacheStats(): Promise<{
    totalCachedRoutes: number;
    cacheKeys: string[];
  }> {
    try {
      const keys = await cacheManager.getAllKeys();
      const routeDetailKeys = keys.filter(key => key.startsWith(ROUTE_DETAILS_CACHE_PREFIX));
      
      return {
        totalCachedRoutes: routeDetailKeys.length,
        cacheKeys: routeDetailKeys,
      };
    } catch (error) {
      console.error('Failed to get route details cache stats:', error);
      return {
        totalCachedRoutes: 0,
        cacheKeys: [],
      };
    }
  }

  /**
   * Preload route details for multiple routes
   */
  static async preloadRouteDetails(routeIds: string[]): Promise<void> {
    try {
      console.log(`Preloading route details for ${routeIds.length} routes`);
      
      const preloadPromises = routeIds.map(async (routeId) => {
        try {
          await this.getRouteDetails(routeId, false);
        } catch (error) {
          console.warn(`Failed to preload route details for ${routeId}:`, error);
        }
      });
      
      await Promise.allSettled(preloadPromises);
      console.log('Route details preloading completed');
    } catch (error) {
      console.error('Failed to preload route details:', error);
    }
  }

  /**
   * Check if route details are cached
   */
  static async isRouteDetailsCached(routeId: string): Promise<boolean> {
    try {
      const cachedData = await this.getCachedRouteDetails(routeId);
      return cachedData !== null;
    } catch (error) {
      console.warn(`Failed to check if route details are cached for ${routeId}:`, error);
      return false;
    }
  }

  /**
   * Get cache expiration time for route details
   */
  static async getRouteDetailsCacheExpiration(routeId: string): Promise<Date | null> {
    try {
      const cacheKey = `${ROUTE_DETAILS_CACHE_PREFIX}${routeId}`;
      const cachedItem = await cacheManager.getCacheItem(cacheKey);
      
      if (cachedItem) {
        const expirationTime = new Date(cachedItem.timestamp + cachedItem.expiresIn);
        return expirationTime;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get cache expiration for route ${routeId}:`, error);
      return null;
    }
  }
}

// Export utility functions for backward compatibility
export const routeDetailsUtils = {
  fetchRouteDetails: RouteDetailsService.fetchRouteDetails,
  getRouteDetails: RouteDetailsService.getRouteDetails,
  saveRouteDetailsToCache: RouteDetailsService.saveRouteDetailsToCache,
  getCachedRouteDetails: RouteDetailsService.getCachedRouteDetails,
  clearCachedRouteDetails: RouteDetailsService.clearCachedRouteDetails,
  clearAllCachedRouteDetails: RouteDetailsService.clearAllCachedRouteDetails,
  getRouteDetailsCacheStats: RouteDetailsService.getRouteDetailsCacheStats,
  preloadRouteDetails: RouteDetailsService.preloadRouteDetails,
  isRouteDetailsCached: RouteDetailsService.isRouteDetailsCached,
  getRouteDetailsCacheExpiration: RouteDetailsService.getRouteDetailsCacheExpiration,
};
