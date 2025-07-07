import React, { useState, useCallback } from 'react';
import { Image, ImageProps, ActivityIndicator, View } from 'react-native';

interface OptimizedImageProps extends ImageProps {
  fallbackSource?: any;
  showLoader?: boolean;
}

/**
 * Optimized Image component with lazy loading and error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallbackSource,
  showLoader = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const imageSource = error && fallbackSource ? fallbackSource : source;

  return (
    <View style={style}>
      <Image
        source={imageSource}
        style={[style, { opacity: loading ? 0.5 : 1 }]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {loading && showLoader && (
        <View
          style={[
            style,
            {
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      )}
    </View>
  );
};
