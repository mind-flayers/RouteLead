import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth'; // adjust if needed

const actions = [
  {
    label: 'Find a Route',
    icon: <FontAwesome name="search" size={32} color="#fff" />,
    active: true,
  },
  {
    label: 'Place Bids',
    icon: <FontAwesome name="dollar" size={32} color="#fff" />,
    active: false,
  },
  {
    label: 'Track Deliveries',
    icon: <MaterialIcons name="local-shipping" size={32} color="#fff" />,
    active: false,
  },
  {
    label: 'View Past Deliveries',
    icon: <Ionicons name="time-outline" size={32} color="#fff" />,
    active: false,
  },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Customer';

  // Calculate tile width for a 2-column layout with some margin
  const tileMargin = 12;
  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const tileSize =
    (screenWidth - tileMargin * (numColumns + 1) - 32 /* container padding */) /
    numColumns;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <Text className="text-xl font-bold tracking-wide">RouteLead</Text>
        <Ionicons name="notifications-outline" size={22} color="#222" />
      </View>

      {/* Welcome */}
      <Text className="text-lg font-semibold px-6 mb-6">
        Welcome, {userName}
      </Text>

      {/* Action Tiles */}
      <View
        className="flex-row flex-wrap px-6"
        style={{ marginBottom: 24 }}
      >
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={action.label}
            activeOpacity={0.8}
            className="rounded-lg mb-4"
            style={{
              width: tileSize,
              height: tileSize,
              marginLeft: idx % numColumns === 0 ? 0 : tileMargin,
              backgroundColor: action.active ? '#FF6600' : '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
              // Add a subtle shadow (iOS & Android)
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              // handle tile press (e.g. navigate)
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: action.active ? '#FF7F11' : '#E5E7EB',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              {action.icon}
            </View>

            {/* Label */}
            <Text
              className={`text-sm font-medium ${
                action.active ? 'text-white' : 'text-gray-800'
              }`}
              style={{ textAlign: 'center' }}
            >
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
        <View className="items-center">
          <Ionicons name="person-outline" size={22} color="#888" />
          <Text className="text-xs mt-1 text-gray-500">Profile</Text>
        </View>
      </View>
    </View>
  );
}
