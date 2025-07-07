import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache Manager for handling all types of caching in the app
 * Supports in-memory cache for quick access and AsyncStorage for persistence
 */

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

interface ImageCacheItem {
  uri: string;
  localPath?: string;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private imageCache = new Map<string, ImageCacheItem>();
  
  // Cache duration constants (in milliseconds)
  private readonly CACHE_DURATIONS = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 60 * 60 * 1000,      // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
    PERSISTENT: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Prefixes for different types of cached data
  private readonly CACHE_PREFIXES = {
    API: 'api_',
    USER: 'user_',
    IMAGE: 'image_',
    ICON: 'icon_',
    ASSET: 'asset_',
    CONFIG: 'config_',
  };

  /**
   * Set data in cache with automatic expiration
   */
  async set<T>(
    key: string, 
    data: T, 
    duration: keyof typeof this.CACHE_DURATIONS = 'MEDIUM',
    persistent: boolean = false
  ): Promise<void> {
    const expiresIn = this.CACHE_DURATIONS[duration];
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    // Always store in memory for quick access
    this.memoryCache.set(key, cacheItem);

    // Store in AsyncStorage if persistent
    if (persistent) {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to store in AsyncStorage:', error);
      }
    }
  }

  /**
   * Get data from cache with automatic expiration check
   */
  async get<T>(key: string, fallbackToPersistent: boolean = true): Promise<T | null> {
    // Try memory cache first
    const memoryCacheItem = this.memoryCache.get(key);
    if (memoryCacheItem && !this.isExpired(memoryCacheItem)) {
      return memoryCacheItem.data as T;
    }

    // Try persistent storage if enabled
    if (fallbackToPersistent) {
      try {
        const persistentData = await AsyncStorage.getItem(key);
        if (persistentData) {
          const cacheItem: CacheItem<T> = JSON.parse(persistentData);
          if (!this.isExpired(cacheItem)) {
            // Restore to memory cache
            this.memoryCache.set(key, cacheItem);
            return cacheItem.data;
          } else {
            // Remove expired data
            await this.remove(key);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from AsyncStorage:', error);
      }
    }

    return null;
  }

  /**
   * Cache API responses with intelligent key generation
   */
  async cacheApiResponse<T>(
    endpoint: string,
    params: Record<string, any> = {},
    data: T,
    duration: keyof typeof this.CACHE_DURATIONS = 'MEDIUM'
  ): Promise<void> {
    const key = this.generateApiCacheKey(endpoint, params);
    await this.set(key, data, duration, true);
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T | null> {
    const key = this.generateApiCacheKey(endpoint, params);
    return this.get<T>(key, true);
  }

  /**
   * Cache user-specific data
   */
  async cacheUserData<T>(
    userId: string,
    dataKey: string,
    data: T,
    duration: keyof typeof this.CACHE_DURATIONS = 'LONG'
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.USER}${userId}_${dataKey}`;
    await this.set(key, data, duration, true);
  }

  /**
   * Get cached user data
   */
  async getCachedUserData<T>(userId: string, dataKey: string): Promise<T | null> {
    const key = `${this.CACHE_PREFIXES.USER}${userId}_${dataKey}`;
    return this.get<T>(key, true);
  }

  /**
   * Cache image metadata (for tracking downloaded images)
   */
  async cacheImageMetadata(
    imageUrl: string,
    localPath?: string,
    duration: keyof typeof this.CACHE_DURATIONS = 'PERSISTENT'
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.IMAGE}${this.hashUrl(imageUrl)}`;
    const imageItem: ImageCacheItem = {
      uri: imageUrl,
      localPath,
      timestamp: Date.now(),
      expiresIn: this.CACHE_DURATIONS[duration],
    };

    this.imageCache.set(key, imageItem);
    
    try {
      await AsyncStorage.setItem(key, JSON.stringify(imageItem));
    } catch (error) {
      console.warn('Failed to cache image metadata:', error);
    }
  }

  /**
   * Get cached image metadata
   */
  async getCachedImageMetadata(imageUrl: string): Promise<ImageCacheItem | null> {
    const key = `${this.CACHE_PREFIXES.IMAGE}${this.hashUrl(imageUrl)}`;
    
    // Check memory first
    const memoryItem = this.imageCache.get(key);
    if (memoryItem && !this.isImageExpired(memoryItem)) {
      return memoryItem;
    }

    // Check persistent storage
    try {
      const persistentData = await AsyncStorage.getItem(key);
      if (persistentData) {
        const imageItem: ImageCacheItem = JSON.parse(persistentData);
        if (!this.isImageExpired(imageItem)) {
          this.imageCache.set(key, imageItem);
          return imageItem;
        } else {
          await this.remove(key);
        }
      }
    } catch (error) {
      console.warn('Failed to get cached image metadata:', error);
    }

    return null;
  }

  /**
   * Cache configuration data
   */
  async cacheConfig<T>(
    configKey: string,
    data: T,
    duration: keyof typeof this.CACHE_DURATIONS = 'VERY_LONG'
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.CONFIG}${configKey}`;
    await this.set(key, data, duration, true);
  }

  /**
   * Get cached configuration
   */
  async getCachedConfig<T>(configKey: string): Promise<T | null> {
    const key = `${this.CACHE_PREFIXES.CONFIG}${configKey}`;
    return this.get<T>(key, true);
  }

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from AsyncStorage:', error);
    }
  }

  /**
   * Clear all cache data
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.imageCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        Object.values(this.CACHE_PREFIXES).some(prefix => key.startsWith(prefix))
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear AsyncStorage cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    // Clear expired memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear expired image cache
    for (const [key, item] of this.imageCache.entries()) {
      if (this.isImageExpired(item)) {
        this.imageCache.delete(key);
      }
    }

    // Clear expired AsyncStorage items
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        Object.values(this.CACHE_PREFIXES).some(prefix => key.startsWith(prefix))
      );

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const item = JSON.parse(data);
          if (this.isExpired(item) || this.isImageExpired(item)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear expired AsyncStorage items:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryItems: number;
    imageItems: number;
    memorySize: number;
  } {
    const memorySize = JSON.stringify([...this.memoryCache.values()]).length;
    
    return {
      memoryItems: this.memoryCache.size,
      imageItems: this.imageCache.size,
      memorySize,
    };
  }

  /**
   * Preload essential data
   */
  async preloadEssentialData(): Promise<void> {
    // This method can be called during app startup to preload critical data
    console.log('Preloading essential cache data...');
    
    // Clear expired items
    await this.clearExpired();
    
    console.log('Cache preload completed');
  }

  // Private helper methods
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.expiresIn;
  }

  private isImageExpired(item: ImageCacheItem): boolean {
    return Date.now() - item.timestamp > item.expiresIn;
  }

  private generateApiCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${this.CACHE_PREFIXES.API}${endpoint}_${this.hashString(paramString)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private hashUrl(url: string): string {
    return this.hashString(url);
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export types for external use
export type { CacheItem, ImageCacheItem };
