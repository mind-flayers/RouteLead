import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 80, // Adjust height as needed
          paddingBottom: 10, // Adjust padding as needed
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB', // gray-200
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="pages/driver/Dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pages/driver/MyRoutes"
        options={{
          title: 'Routes',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="truck-delivery" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pages/driver/MyEarnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => <FontAwesome5 name="dollar-sign" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pages/driver/ChatList"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pages/driver/Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
