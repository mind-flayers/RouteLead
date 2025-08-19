# Route Details Caching Guide

This guide explains how to use the route details caching functionality implemented in the RouteLead app.

## Overview

The route details caching system provides:
- **Automatic caching** of route details data
- **Offline support** with cached data fallback
- **Background refresh** for up-to-date information
- **Cache management** tools for debugging and maintenance

## Architecture

### Components

1. **RouteDetailsService** (`fe/services/routeDetailsService.ts`)
   - Main service for managing route details data
   - Handles API calls, caching, and data transformation

2. **CacheManager** (`fe/lib/cache.ts`)
   - Low-level cache management
   - Supports both memory and persistent storage

3. **RouteDetails Component** (`fe/app/pages/customer/RouteDetails.tsx`)
   - UI component that uses the caching service
   - Provides user interface for cache management

## Usage

### Basic Usage

```typescript
import { RouteDetailsService } from '@/services/routeDetailsService';

// Get route details (with automatic caching)
const routeDetails = await RouteDetailsService.getRouteDetails(routeId, false);

// Force refresh from API
const freshRouteDetails = await RouteDetailsService.getRouteDetails(routeId, true);
```

### Service Methods

#### `getRouteDetails(routeId: string, forceRefresh: boolean = false)`
- **Purpose**: Get route details from cache or API
- **Parameters**:
  - `routeId`: The unique identifier for the route
  - `forceRefresh`: If true, bypasses cache and fetches from API
- **Returns**: `Promise<RouteDetailsData | null>`

#### `fetchRouteDetails(routeId: string)`
- **Purpose**: Fetch route details from API and cache them
- **Parameters**:
  - `routeId`: The unique identifier for the route
- **Returns**: `Promise<RouteDetailsData>`

#### `saveRouteDetailsToCache(routeId: string, data: RouteDetailsData)`
- **Purpose**: Save route details to cache
- **Parameters**:
  - `routeId`: The unique identifier for the route
  - `data`: The route details data to cache

#### `getCachedRouteDetails(routeId: string)`
- **Purpose**: Get route details from cache only
- **Parameters**:
  - `routeId`: The unique identifier for the route
- **Returns**: `Promise<RouteDetailsData | null>`

#### `clearCachedRouteDetails(routeId: string)`
- **Purpose**: Clear cached route details for a specific route
- **Parameters**:
  - `routeId`: The unique identifier for the route

#### `clearAllCachedRouteDetails()`
- **Purpose**: Clear all cached route details

#### `getRouteDetailsCacheStats()`
- **Purpose**: Get statistics about cached route details
- **Returns**: `Promise<{ totalCachedRoutes: number; cacheKeys: string[] }>`

#### `isRouteDetailsCached(routeId: string)`
- **Purpose**: Check if route details are cached
- **Parameters**:
  - `routeId`: The unique identifier for the route
- **Returns**: `Promise<boolean>`

#### `preloadRouteDetails(routeIds: string[])`
- **Purpose**: Preload route details for multiple routes
- **Parameters**:
  - `routeIds`: Array of route IDs to preload

## Data Structure

### RouteDetailsData Interface

```typescript
interface RouteDetailsData {
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
```

## Cache Configuration

### Cache Duration
- **MEDIUM**: 30 minutes (default for route details)
- **SHORT**: 5 minutes
- **LONG**: 1 hour
- **VERY_LONG**: 24 hours
- **PERSISTENT**: 7 days

### Cache Storage
- **Memory Cache**: Fast access for active sessions
- **AsyncStorage**: Persistent storage across app restarts

## Implementation in Components

### Example: RouteDetails Component

```typescript
import React, { useEffect, useState } from 'react';
import { RouteDetailsService, RouteDetailsData } from '@/services/routeDetailsService';

export default function RouteDetails() {
  const [routeData, setRouteData] = useState<RouteDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadRouteDetails();
  }, [routeId]);

  const loadRouteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const routeDetails = await RouteDetailsService.getRouteDetails(routeId, false);
      
      if (routeDetails) {
        setRouteData(routeDetails);
        setIsOffline(false);
      } else {
        throw new Error('No route details available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load route details');
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshRouteDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const routeDetails = await RouteDetailsService.getRouteDetails(routeId, true);
      
      if (routeDetails) {
        setRouteData(routeDetails);
        setIsOffline(false);
      } else {
        throw new Error('No route details available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh route details');
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## Error Handling

### Network Errors
- When API calls fail, the system falls back to cached data
- Users see an offline indicator when using cached data
- Retry functionality allows users to attempt fresh API calls

### Cache Errors
- Cache failures are logged but don't break the app
- Graceful degradation to API-only mode when cache is unavailable

## Performance Considerations

### Memory Usage
- Cache is automatically cleaned up when expired
- Memory cache is cleared on app restart
- Large datasets are stored in persistent storage

### Network Optimization
- Cached data is shown immediately while fresh data loads in background
- API calls are only made when necessary
- Preloading supports bulk data fetching

## Debugging

### Cache Statistics
```typescript
const stats = await RouteDetailsService.getRouteDetailsCacheStats();
console.log('Cached routes:', stats.totalCachedRoutes);
console.log('Cache keys:', stats.cacheKeys);
```

### Cache Management
```typescript
// Clear specific route cache
await RouteDetailsService.clearCachedRouteDetails(routeId);

// Clear all route caches
await RouteDetailsService.clearAllCachedRouteDetails();

// Check if route is cached
const isCached = await RouteDetailsService.isRouteDetailsCached(routeId);
```

### Cache Expiration
```typescript
const expiration = await RouteDetailsService.getRouteDetailsCacheExpiration(routeId);
console.log('Cache expires at:', expiration);
```

## Best Practices

1. **Always use the service methods** instead of direct cache access
2. **Handle offline scenarios** gracefully with user feedback
3. **Implement retry logic** for failed API calls
4. **Monitor cache statistics** in development
5. **Clear cache when needed** for debugging or data consistency

## Troubleshooting

### Common Issues

1. **Cache not updating**
   - Check if `forceRefresh` parameter is set to `true`
   - Verify cache expiration times
   - Clear cache manually if needed

2. **Offline mode not working**
   - Ensure cache is being saved properly
   - Check AsyncStorage permissions
   - Verify cache key generation

3. **Performance issues**
   - Monitor cache size and clear old entries
   - Use preloading for frequently accessed routes
   - Implement cache size limits if needed

### Debug Commands

```typescript
// Get all cache statistics
const allStats = await RouteDetailsService.getRouteDetailsCacheStats();

// Check specific route cache status
const isCached = await RouteDetailsService.isRouteDetailsCached(routeId);
const expiration = await RouteDetailsService.getRouteDetailsCacheExpiration(routeId);

// Clear problematic cache
await RouteDetailsService.clearCachedRouteDetails(routeId);
```

## Future Enhancements

1. **Cache compression** for large datasets
2. **Background sync** for offline changes
3. **Cache analytics** and usage tracking
4. **Smart preloading** based on user behavior
5. **Cache versioning** for data schema changes
