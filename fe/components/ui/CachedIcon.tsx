import React, { useMemo } from 'react';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  MaterialIcons, 
  Feather,
  AntDesign,
  Entypo
} from '@expo/vector-icons';
import { TextStyle, StyleProp, OpaqueColorValue } from 'react-native';

// Supported icon families
export type IconFamily = 
  | 'Ionicons' 
  | 'MaterialCommunityIcons' 
  | 'FontAwesome5' 
  | 'MaterialIcons' 
  | 'Feather'
  | 'AntDesign'
  | 'Entypo';

interface CachedIconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

// Icon component cache - memoizes icon components to prevent re-renders
const iconComponentCache = new Map<string, React.ComponentType<any>>();

/**
 * Cached Icon component that optimizes icon rendering and prevents unnecessary re-renders
 * Automatically selects the appropriate icon family and caches components
 */
export const CachedIcon: React.FC<CachedIconProps> = React.memo(({
  family,
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const IconComponent = useMemo(() => {
    const cacheKey = `${family}`;
    
    // Check if we already have this icon component cached
    if (iconComponentCache.has(cacheKey)) {
      return iconComponentCache.get(cacheKey)!;
    }

    // Create the appropriate icon component
    let Component: React.ComponentType<any>;
    
    switch (family) {
      case 'Ionicons':
        Component = Ionicons;
        break;
      case 'MaterialCommunityIcons':
        Component = MaterialCommunityIcons;
        break;
      case 'FontAwesome5':
        Component = FontAwesome5;
        break;
      case 'MaterialIcons':
        Component = MaterialIcons;
        break;
      case 'Feather':
        Component = Feather;
        break;
      case 'AntDesign':
        Component = AntDesign;
        break;
      case 'Entypo':
        Component = Entypo;
        break;
      default:
        Component = Ionicons; // Default fallback
        console.warn(`Unsupported icon family: ${family}, falling back to Ionicons`);
    }

    // Cache the component for future use
    iconComponentCache.set(cacheKey, Component);
    return Component;
  }, [family]);

  // Memoize props to prevent unnecessary re-renders
  const iconProps = useMemo(() => ({
    name: name as any,
    size,
    color,
    style,
  }), [name, size, color, style]);

  return React.createElement(IconComponent, iconProps);
});

CachedIcon.displayName = 'CachedIcon';

/**
 * Pre-defined commonly used icons for even better performance
 * These are the most frequently used icons in the app
 */
export const CommonIcons = {
  // Navigation icons
  Home: React.memo(() => <CachedIcon family="Ionicons" name="home" size={22} />),
  Back: React.memo(() => <CachedIcon family="Ionicons" name="arrow-back" size={24} />),
  Forward: React.memo(() => <CachedIcon family="Ionicons" name="arrow-forward" size={24} />),
  Menu: React.memo(() => <CachedIcon family="Ionicons" name="menu" size={24} />),
  Close: React.memo(() => <CachedIcon family="Ionicons" name="close" size={24} />),

  // Action icons
  Add: React.memo(() => <CachedIcon family="Ionicons" name="add" size={24} />),
  Edit: React.memo(() => <CachedIcon family="FontAwesome5" name="edit" size={20} />),
  Delete: React.memo(() => <CachedIcon family="Ionicons" name="trash" size={20} />),
  Save: React.memo(() => <CachedIcon family="Ionicons" name="checkmark" size={24} />),
  Search: React.memo(() => <CachedIcon family="Ionicons" name="search" size={24} />),

  // Status icons
  Success: React.memo(() => <CachedIcon family="Ionicons" name="checkmark-circle" size={24} color="#22C55E" />),
  Error: React.memo(() => <CachedIcon family="Ionicons" name="close-circle" size={24} color="#EF4444" />),
  Warning: React.memo(() => <CachedIcon family="Ionicons" name="warning" size={24} color="#F59E0B" />),
  Info: React.memo(() => <CachedIcon family="Ionicons" name="information-circle" size={24} color="#3B82F6" />),

  // Communication icons
  Call: React.memo(() => <CachedIcon family="Ionicons" name="call" size={20} />),
  Message: React.memo(() => <CachedIcon family="Ionicons" name="chatbubble" size={20} />),
  Email: React.memo(() => <CachedIcon family="Ionicons" name="mail" size={20} />),

  // Vehicle/Delivery icons
  Truck: React.memo(() => <CachedIcon family="MaterialCommunityIcons" name="truck-delivery" size={24} />),
  Car: React.memo(() => <CachedIcon family="Ionicons" name="car" size={24} />),
  Location: React.memo(() => <CachedIcon family="Ionicons" name="location" size={24} />),
  Route: React.memo(() => <CachedIcon family="MaterialCommunityIcons" name="map-marker-path" size={24} />),

  // Profile icons
  Person: React.memo(() => <CachedIcon family="Ionicons" name="person" size={24} />),
  Settings: React.memo(() => <CachedIcon family="Ionicons" name="settings" size={24} />),
  Logout: React.memo(() => <CachedIcon family="Ionicons" name="log-out" size={24} />),

  // Financial icons
  Money: React.memo(() => <CachedIcon family="FontAwesome5" name="dollar-sign" size={24} />),
  Wallet: React.memo(() => <CachedIcon family="FontAwesome5" name="wallet" size={20} />),
  CreditCard: React.memo(() => <CachedIcon family="FontAwesome5" name="credit-card" size={20} />),

  // Document icons
  Document: React.memo(() => <CachedIcon family="MaterialCommunityIcons" name="file-document-outline" size={24} />),
  Upload: React.memo(() => <CachedIcon family="Ionicons" name="cloud-upload-outline" size={20} />),
  Download: React.memo(() => <CachedIcon family="Ionicons" name="cloud-download-outline" size={20} />),

  // Rating/Review icons
  Star: React.memo(() => <CachedIcon family="Ionicons" name="star" size={14} color="#FFD600" />),
  StarOutline: React.memo(() => <CachedIcon family="Ionicons" name="star-outline" size={14} />),
  Heart: React.memo(() => <CachedIcon family="Ionicons" name="heart" size={20} />),
  
  // Utility icons
  Eye: React.memo(() => <CachedIcon family="Ionicons" name="eye" size={20} />),
  EyeOff: React.memo(() => <CachedIcon family="Ionicons" name="eye-off" size={20} />),
  Copy: React.memo(() => <CachedIcon family="Ionicons" name="copy" size={20} />),
  Share: React.memo(() => <CachedIcon family="Ionicons" name="share" size={20} />),
  Refresh: React.memo(() => <CachedIcon family="Ionicons" name="refresh" size={20} />),
};

/**
 * Helper function to clear icon cache (useful for memory management)
 */
export const clearIconCache = (): void => {
  iconComponentCache.clear();
};

/**
 * Get cache statistics
 */
export const getIconCacheStats = (): { cachedIcons: number } => {
  return {
    cachedIcons: iconComponentCache.size,
  };
};
