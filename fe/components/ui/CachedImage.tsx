import React, { useState, useCallback, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, Text } from 'react-native';
import { cacheManager } from '../../lib/cache';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number; // Support both remote URLs and local assets
  fallbackSource?: { uri: string } | number;
  showLoader?: boolean;
  placeholder?: React.ReactNode;
  cachePolicy?: 'memory' | 'persistent' | 'network-only';
  retryCount?: number;
  onCacheHit?: () => void;
  onCacheMiss?: () => void;
}

/**
 * Enhanced Image component with comprehensive caching capabilities
 * Supports both remote URLs and local assets with intelligent caching
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  fallbackSource,
  showLoader = true,
  placeholder,
  cachePolicy = 'persistent',
  retryCount = 3,
  onCacheHit,
  onCacheMiss,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSource, setCurrentSource] = useState(source);
  const [retries, setRetries] = useState(0);

  // Handle cache checking for remote images
  useEffect(() => {
    if (typeof source === 'object' && source.uri) {
      checkCache(source.uri);
    } else {
      // Local asset, no caching needed
      setLoading(false);
    }
  }, [source]);

  const checkCache = async (uri: string) => {
    if (cachePolicy === 'network-only') {
      onCacheMiss?.();
      return;
    }

    try {
      const cachedMetadata = await cacheManager.getCachedImageMetadata(uri);
      if (cachedMetadata) {
        onCacheHit?.();
        // Image is cached, proceed with normal loading
        return;
      } else {
        onCacheMiss?.();
        // Cache the metadata when image loads successfully
      }
    } catch (error) {
      console.warn('Error checking image cache:', error);
    }
  };

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(async () => {
    console.warn('Image load error:', currentSource);
    
    if (retries < retryCount) {
      // Retry loading
      setRetries(prev => prev + 1);
      setTimeout(() => {
        setError(false);
        setLoading(true);
      }, 1000 * (retries + 1)); // Exponential backoff
      return;
    }

    setLoading(false);
    setError(true);

    // Try fallback source
    if (fallbackSource && currentSource !== fallbackSource) {
      setCurrentSource(fallbackSource);
      setError(false);
      setLoading(true);
      setRetries(0);
    }
  }, [currentSource, fallbackSource, retries, retryCount]);

  const handleLoadSuccess = useCallback(async () => {
    // Cache successful loads for remote images
    if (typeof currentSource === 'object' && currentSource.uri && cachePolicy !== 'network-only') {
      try {
        await cacheManager.cacheImageMetadata(currentSource.uri);
      } catch (error) {
        console.warn('Failed to cache image metadata:', error);
      }
    }
  }, [currentSource, cachePolicy]);

  const renderLoadingState = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View
        style={[
          style,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
          },
        ]}
      >
        {showLoader && <ActivityIndicator size="small" color="#f97316" />}
      </View>
    );
  };

  const renderErrorState = () => {
    return (
      <View
        style={[
          style,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
          },
        ]}
      >
        <Text style={{ color: '#999', fontSize: 12 }}>⚠️</Text>
      </View>
    );
  };

  if (error && !fallbackSource) {
    return renderErrorState();
  }

  return (
    <View style={style}>
      <Image
        source={currentSource}
        style={[style, { opacity: loading ? 0.7 : 1 }]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onLoad={handleLoadSuccess}
        {...props}
      />
      {loading && renderLoadingState()}
    </View>
  );
};

// Export enhanced OptimizedImage that uses the new CachedImage
export const OptimizedImage: React.FC<CachedImageProps> = (props) => {
  return <CachedImage {...props} />;
};
