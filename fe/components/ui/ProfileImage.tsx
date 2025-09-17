import React from 'react';
import { View, ActivityIndicator, ViewStyle, ImageStyle } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { useProfilePhoto, useCurrentUserProfilePhoto } from '@/hooks/useProfilePhoto';

interface ProfileImageProps {
  userId?: string | null;
  size?: number;
  style?: ViewStyle | ImageStyle;
  className?: string;
  showLoader?: boolean;
  borderRadius?: number;
  useCurrentUser?: boolean; // If true, ignores userId and uses current authenticated user
}

/**
 * Standardized ProfileImage component that fetches profile photos from database
 * Handles loading states, error states, and fallback to placeholder
 */
export const ProfileImage: React.FC<ProfileImageProps> = ({
  userId,
  size = 40,
  style,
  className = '',
  showLoader = true,
  borderRadius,
  useCurrentUser = false,
}) => {
  // Debug logging to identify problematic userIds
  if (userId && typeof userId === 'string') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('ProfileImage received invalid userId format:', userId);
    }
  }

  // Only call the hook we need based on the useCurrentUser flag
  // This prevents multiple subscription conflicts
  const currentUserPhoto = useCurrentUser ? useCurrentUserProfilePhoto() : { profilePhotoUrl: null, loading: false };
  const specificUserPhoto = !useCurrentUser && userId ? useProfilePhoto(userId) : { profilePhotoUrl: null, loading: false };
  
  // Choose which hook result to use
  const { profilePhotoUrl, loading } = useCurrentUser ? currentUserPhoto : specificUserPhoto;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius !== undefined ? borderRadius : size / 2, // Default to circular
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Light gray background
    ...style,
  };

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius !== undefined ? borderRadius : size / 2,
  };

  // Show loading indicator while fetching
  if (loading && showLoader) {
    return (
      <View style={containerStyle} className={className}>
        <ActivityIndicator size="small" color="#f97316" />
      </View>
    );
  }

  // Determine image source
  const imageSource = profilePhotoUrl 
    ? { uri: profilePhotoUrl }
    : require('../../assets/images/profile_placeholder.jpeg');

  return (
    <View style={containerStyle} className={className}>
      <OptimizedImage
        source={imageSource}
        fallbackSource={require('../../assets/images/profile_placeholder.jpeg')}
        style={imageStyle}
        showLoader={showLoader && !loading}
      />
    </View>
  );
};

/**
 * Specialized component for small profile avatars (like in top bars)
 */
export const ProfileAvatar: React.FC<Omit<ProfileImageProps, 'size'> & { size?: 24 | 32 | 40 | 48 }> = ({
  size = 32,
  ...props
}) => {
  return <ProfileImage size={size} {...props} />;
};

/**
 * Specialized component for large profile pictures (like in profile pages)
 */
export const ProfilePicture: React.FC<Omit<ProfileImageProps, 'size'> & { size?: 80 | 100 | 120 | 150 }> = ({
  size = 100,
  ...props
}) => {
  return <ProfileImage size={size} {...props} />;
};