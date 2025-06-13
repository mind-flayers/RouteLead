import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth';
import { router } from 'expo-router';

const actions = [
  {
    label: 'Find a Route',
    icon: <FontAwesome name="search" size={32} color="#fff" />,
    active: true,
    route: '/pages/customer/FindRoute',
  },
  {
    label: 'My Bids',
    icon: <FontAwesome name="dollar" size={32} color="#fff" />,
     active: true,
  route: '/pages/customer/MyBids', 
  },
  {
    label: 'Track Deliveries',
    icon: <MaterialIcons name="local-shipping" size={32} color="#fff" />,
    active: true,
    route: '/pages/customer/TrackingDelivery', 
  },
  {
    label: 'View Past Deliveries',
    icon: <Ionicons name="time-outline" size={32} color="#fff" />,
    active: true, 
    route: '/pages/customer/PastDeliveries', 
  },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Customer';

  const tileMargin = 12;
  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const tileSize =
    (screenWidth - tileMargin * (numColumns + 1) - 32) / numColumns;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <Text className="text-xl font-bold tracking-wide">RouteLead</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#222"
            style={{ marginRight: 16 }}
          />
          <TouchableOpacity onPress={() => router.push('/pages/customer/Profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome */}
      <Text className="text-lg font-semibold px-6 mb-6">
        Welcome, {userName}
      </Text>

      {/* Action Tiles */}
      <View className="flex-row flex-wrap px-6" style={{ marginBottom: 24 }}>
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={action.label}
            activeOpacity={0.8}
            className="rounded-lg mb-4"
            style={{
              width: tileSize,
              height: tileSize,
              marginLeft: idx % numColumns === 0 ? 0 : tileMargin,
              backgroundColor: '#0D47A1',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              if (action.route) {
                router.push(action.route as any);
              }
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#FF8C00',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {action.icon}
            </View>

            {/* Label */}
            <Text className="text-sm font-medium text-white" style={{ textAlign: 'center' }}>
  {action.label}
</Text>

          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center h-16 border-t border-gray-200 bg-white">
        <View className="items-center">
          <Ionicons name="home" size={22} color="#FF6600" />
          <Text className="text-xs mt-1 font-semibold text-black">Home</Text>
        </View>
        <View className="items-center">
          <MaterialIcons name="local-shipping" size={22} color="#888" />
          <Text className="text-xs mt-1 text-gray-500">Deliveries</Text>
        </View>
        <View className="items-center">
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#888" />
          <Text className="text-xs mt-1 text-gray-500">Messages</Text>
        </View>
      
      </View>
    </View>
  );
}
