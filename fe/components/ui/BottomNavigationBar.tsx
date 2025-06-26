import React from 'react';
import { View, Text, Dimensions, Platform, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface BottomNavigationBarProps {
  activeTab: 'home' | 'routes' | 'earnings' | 'chats' | 'profile';
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ activeTab }) => {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 375; // iPhone SE and smaller screens
  const isVerySmallScreen = screenWidth < 320; // Very small screens
  
  const getTabStyle = (tabName: string) => ({
    iconColor: activeTab === tabName ? '#F97316' : 'gray',
    textColor: activeTab === tabName ? '#F97316' : '#6B7280'
  });

  // Responsive sizing
  const iconSize = isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22;
  const textSize = isVerySmallScreen ? 9 : isSmallScreen ? 10 : 12;
  const containerPadding = isSmallScreen ? 'py-1 px-0.5' : 'py-2 px-1';
  const minHeight = isSmallScreen ? 'min-h-[42px]' : 'min-h-[48px]';
  const tabPadding = isVerySmallScreen ? 'px-0.5' : 'px-1';

  return (
    <View 
      className={`flex-row justify-around items-center mb-4 bg-white border-t border-gray-200 ${containerPadding} absolute bottom-0 w-full`}
      style={{
        paddingBottom: Platform.OS === 'ios' ? 8 : 4, // Extra padding for iOS safe area
      }}
    >
      {/* Home Tab */}
      <Link href="/pages/driver/Dashboard" className="flex-1 items-center">
        <View className={`items-center ${minHeight} justify-center ${tabPadding}`}>
          <Ionicons name="home" size={iconSize} color={getTabStyle('home').iconColor} />
          <Text 
            style={[styles.tabText, { color: getTabStyle('home').textColor, fontSize: textSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Home
          </Text>
        </View>
      </Link>

      {/* Routes Tab */}
      <Link href="/pages/driver/MyRoutes" className="flex-1 items-center">
        <View className={`items-center ${minHeight} justify-center ${tabPadding}`}>
          <MaterialCommunityIcons 
            name="truck-delivery" 
            size={iconSize} 
            color={getTabStyle('routes').iconColor} 
          />
          <Text 
            style={[styles.tabText, { color: getTabStyle('routes').textColor, fontSize: textSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Routes
          </Text>
        </View>
      </Link>

      {/* Earnings Tab */}
      <Link href="/pages/driver/MyEarnings" className="flex-1 items-center">
        <View className={`items-center ${minHeight} justify-center ${tabPadding}`}>
          <FontAwesome5 
            name="dollar-sign" 
            size={iconSize} 
            color={getTabStyle('earnings').iconColor} 
          />
          <Text 
            style={[styles.tabText, { color: getTabStyle('earnings').textColor, fontSize: textSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Earnings
          </Text>
        </View>
      </Link>

      {/* Chats Tab */}
      <Link href="/pages/driver/ChatList" className="flex-1 items-center">
        <View className={`items-center ${minHeight} justify-center ${tabPadding}`}>
          <Ionicons 
            name="chatbubbles" 
            size={iconSize} 
            color={getTabStyle('chats').iconColor} 
          />
          <Text 
            style={[styles.tabText, { color: getTabStyle('chats').textColor, fontSize: textSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Chats
          </Text>
        </View>
      </Link>

      {/* Profile Tab */}
      <Link href="/pages/driver/Profile" className="flex-1 items-center">
        <View className={`items-center ${minHeight} justify-center ${tabPadding}`}>
          <Ionicons 
            name="person" 
            size={iconSize} 
            color={getTabStyle('profile').iconColor} 
          />
          <Text 
            style={[styles.tabText, { color: getTabStyle('profile').textColor, fontSize: textSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Profile
          </Text>
        </View>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  tabText: {
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
});

export default BottomNavigationBar;