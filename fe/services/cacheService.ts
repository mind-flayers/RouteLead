import { cacheManager } from '../lib/cache';
import { clearIconCache } from '../components/ui/CachedIcon';

/**
 * Cache Service for managing app-wide caching operations
 * Handles initialization, cleanup, and maintenance of all cache types
 */

class CacheService {
  private isInitialized = false;
  private cleanupInterval: any = null;

  /**
   * Initialize cache service - call this during app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Cache service already initialized');
      return;
    }

    console.log('Initializing cache service...');

    try {
      // Preload essential cached data
      await cacheManager.preloadEssentialData();

      // Set up periodic cleanup (every 30 minutes)
      this.setupPeriodicCleanup();

      // Preload common configurations
      await this.preloadCommonData();

      this.isInitialized = true;
      console.log('Cache service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cache service:', error);
    }
  }

  /**
   * Preload commonly used data to improve initial app performance
   */
  private async preloadCommonData(): Promise<void> {
    try {
      // Cache app configuration
      const appConfig = {
        version: '1.0.0',
        supportedLanguages: ['en', 'si'],
        defaultCurrency: 'LKR',
        maxFileSize: 10 * 1024 * 1024, // 10MB
      };
      await cacheManager.cacheConfig('app_config', appConfig, 'PERSISTENT');

      // Cache commonly used static data
      const vehicleTypes = [
        { id: 'bike', name: 'Motorcycle', icon: 'motorcycle' },
        { id: 'car', name: 'Car', icon: 'car' },
        { id: 'van', name: 'Van', icon: 'bus' },
        { id: 'truck', name: 'Truck', icon: 'truck' },
      ];
      await cacheManager.cacheConfig('vehicle_types', vehicleTypes, 'PERSISTENT');

      // Cache common locations/cities
      const commonCities = [
        'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Badulla', 'Anuradhapura',
        'Polonnaruwa', 'Kurunegala', 'Ratnapura', 'Batticaloa'
      ];
      await cacheManager.cacheConfig('common_cities', commonCities, 'PERSISTENT');

      console.log('Common data preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload common data:', error);
    }
  }

  /**
   * Set up periodic cache cleanup
   */
  private setupPeriodicCleanup(): void {
    // Clean up expired entries every 30 minutes
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.performMaintenance();
      } catch (error) {
        console.warn('Cache maintenance failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Perform cache maintenance operations
   */
  async performMaintenance(): Promise<void> {
    console.log('Performing cache maintenance...');

    try {
      // Clear expired cache entries
      await cacheManager.clearExpired();

      // Clear icon cache if it gets too large
      const iconStats = { cachedIcons: 0 }; // Simplified for now
      if (iconStats.cachedIcons > 100) {
        clearIconCache();
        console.log('Icon cache cleared due to size limit');
      }

      // Log cache statistics
      const stats = cacheManager.getCacheStats();
      console.log('Cache stats after maintenance:', stats);
    } catch (error) {
      console.error('Cache maintenance error:', error);
    }
  }

  /**
   * Preload user-specific data when user logs in
   */
  async preloadUserData(userId: string): Promise<void> {
    console.log(`Preloading data for user: ${userId}`);

    try {
      // This can be expanded based on app requirements
      // For now, we'll just ensure the cache is ready for user data
      
      // You can add specific user data preloading here
      // For example:
      // - User profile data
      // - User preferences
      // - Recent activity data
      
    } catch (error) {
      console.warn('Failed to preload user data:', error);
    }
  }

  /**
   * Clear user-specific cache when user logs out
   */
  async clearUserData(userId: string): Promise<void> {
    console.log(`Clearing cache for user: ${userId}`);

    try {
      // Get all cache keys and remove user-specific ones
      // This is a simplified implementation
      // In a real app, you might want to be more selective
      await cacheManager.clearAll();
      console.log('User cache cleared successfully');
    } catch (error) {
      console.warn('Failed to clear user cache:', error);
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  async getCacheStatistics(): Promise<{
    memory: any;
    storage: string;
    lastMaintenance: Date;
  }> {
    const memoryStats = cacheManager.getCacheStats();
    
    return {
      memory: memoryStats,
      storage: 'Available', // Simplified
      lastMaintenance: new Date(),
    };
  }

  /**
   * Force clear all cache (useful for troubleshooting)
   */
  async clearAllCache(): Promise<void> {
    console.log('Clearing all cache...');
    
    try {
      await cacheManager.clearAll();
      clearIconCache();
      console.log('All cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Cleanup resources when app is closing
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isInitialized = false;
    console.log('Cache service cleanup completed');
  }

  /**
   * Check if cache service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export utility functions for specific caching needs
export const cacheUtils = {
  /**
   * Cache an image URL for better loading performance
   */
  async cacheImageUrl(url: string): Promise<void> {
    try {
      await cacheManager.cacheImageMetadata(url);
    } catch (error) {
      console.warn('Failed to cache image URL:', error);
    }
  },

  /**
   * Cache API response with automatic key generation
   */
  async cacheApiResponse<T>(
    endpoint: string,
    data: T,
    params: Record<string, any> = {}
  ): Promise<void> {
    try {
      await cacheManager.cacheApiResponse(endpoint, params, data);
    } catch (error) {
      console.warn('Failed to cache API response:', error);
    }
  },

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T | null> {
    try {
      return await cacheManager.getCachedApiResponse<T>(endpoint, params);
    } catch (error) {
      console.warn('Failed to get cached API response:', error);
      return null;
    }
  },
};
