import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import NavigationErrorBoundary from './NavigationErrorBoundary';
import { useNavigationDebounce } from '../../hooks/useNavigationDebounce';

interface NavItem {
  href: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  label: string;
  testID?: string;
}

const navItems: NavItem[] = [
  {
    href: '/pages/driver/Dashboard',
    icon: 'home',
    iconFamily: 'Ionicons',
    label: 'Home',
    testID: 'nav-home'
  },
  {
    href: '/pages/driver/MyRoutes',
    icon: 'truck-delivery',
    iconFamily: 'MaterialCommunityIcons',
    label: 'Routes',
    testID: 'nav-routes'
  },
  {
    href: '/pages/driver/MyEarnings',
    icon: 'dollar-sign',
    iconFamily: 'FontAwesome5',
    label: 'Earnings',
    testID: 'nav-earnings'
  },
  {
    href: '/pages/driver/ChatList',
    icon: 'chatbubbles',
    iconFamily: 'Ionicons',
    label: 'Chats',
    testID: 'nav-chats'
  },
  {
    href: '/pages/driver/Profile',
    icon: 'person',
    iconFamily: 'Ionicons',
    label: 'Profile',
    testID: 'nav-profile'
  }
];

const DriverBottomNavigation: React.FC = () => {
  const router = useRouter();
  const { debouncedNavigate } = useNavigationDebounce(300);
  let pathname: string = '';
  
  try {
    pathname = usePathname();
  } catch (error) {
    console.warn('Error getting pathname in DriverBottomNavigation:', error);
    // Fallback to an empty string if pathname fails
    pathname = '';
  }

  const getIconComponent = useCallback((item: NavItem, isActive: boolean) => {
    const iconColor = isActive ? '#F97316' : 'gray';
    const iconSize = 22;

    const iconProps = {
      name: item.icon as any,
      size: iconSize,
      color: iconColor
    };

    try {
      switch (item.iconFamily) {
        case 'Ionicons':
          return <Ionicons {...iconProps} />;
        case 'MaterialCommunityIcons':
          return <MaterialCommunityIcons {...iconProps} />;
        case 'FontAwesome5':
          return <FontAwesome5 {...iconProps} />;
        default:
          return <Ionicons {...iconProps} />;
      }
    } catch (error) {
      console.warn('Error rendering icon:', error);
      // Fallback to basic Ionicons home icon
      return <Ionicons name="home" size={iconSize} color={iconColor} />;
    }
  }, []);

  const handleNavigation = useCallback((href: string) => {
    debouncedNavigate(() => {
      try {
        router.push(href as any);
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    });
  }, [router, debouncedNavigate]);

  const renderNavItem = useCallback((item: NavItem) => {
    const isActive = pathname === item.href;
    const textColor = isActive ? 'text-orange-500' : 'text-gray-500';

    return (
      <TouchableOpacity 
        key={item.href}
        className="flex-1 items-center justify-center py-1" 
        style={{ minHeight: 56 }}
        testID={item.testID}
        activeOpacity={0.7}
        onPress={() => handleNavigation(item.href)}
      >
        <View className="items-center justify-center">
          {getIconComponent(item, isActive)}
          <Text 
            className={`${textColor} text-xs mt-1`} 
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [pathname, getIconComponent, handleNavigation]);

  const navigationItems = useMemo(() => navItems.map(renderNavItem), [renderNavItem]);

  return (
    <NavigationErrorBoundary>
      <View 
        className="flex-row justify-between items-center bg-white border-t border-gray-200 px-2 py-2 absolute bottom-0 w-full" 
        style={{ 
          minHeight: 60,
          zIndex: 999 // Ensure navigation stays on top
        }}
        testID="driver-bottom-navigation"
      >
        {navigationItems}
      </View>
    </NavigationErrorBoundary>
  );
};

export default DriverBottomNavigation;
