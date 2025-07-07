import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';

export default function RouteDetails() {
  const params = useLocalSearchParams();
  
  // Extract route data from params (matching MyRoutes structure)
  const routeId = params.id as string || '1';
  const origin = params.origin as string || 'Colombo';
  const destination = params.destination as string || 'Badulla';
  const status = params.status as string || 'Active';
  const date = params.date as string || 'Oct 26, 2025';
  const timer = params.timer as string || '02 D | 02:56:48 H';
  const bids = params.bids as string || '7';
  const highestBid = params.highestBid as string || 'LKR 250.00';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Route Details</Text>
        <View className="w-6" /> {/* Spacer for centering */}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Route Image */}
        <View className="mb-4">
          <Image
            source={{ uri: 'https://via.placeholder.com/300x150' }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity className="absolute bottom-2 right-2 bg-black px-3 py-1 rounded-full">
            <Text className="text-white text-xs">View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Route Information Card */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text className="text-lg font-semibold ml-2">{origin}</Text>
            <View className={`ml-auto px-3 py-1 rounded-full ${status === 'Active' ? 'bg-orange-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-bold ${status === 'Active' ? 'text-orange-600' : 'text-red-600'}`}>
                {status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="arrow-down" size={20} color="gray" style={{ marginLeft: 2 }} />
            <Text className="text-lg font-semibold ml-2">{destination}</Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">{date}</Text>
          </View>
          
          {status === 'Active' && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={18} color="gray" />
              <Text className="text-gray-600 ml-2">{timer}</Text>
            </View>
          )}
          
          <View className="flex-row items-center mb-4">
            <Ionicons name="people-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">{bids} Bids | Highest: </Text>
            <Text className="text-orange-500 font-bold">{highestBid}</Text>
          </View>
        </PrimaryCard>

        {/* Route Overview */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <Text className="text-base font-semibold mb-3">Route Overview</Text>
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-orange-600 font-bold text-lg">{highestBid}</Text>
              <Text className="text-xs text-gray-500">Highest Bid</Text>
            </View>
            <View>
              <Text className="text-gray-700 font-semibold text-sm">1 hr 45 min</Text>
              <Text className="text-xs text-gray-500">45.2 km</Text>
            </View>
          </View>
          
          {/* Route Tags */}
          <View className="flex-row flex-wrap">
            <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Heavy Cargo</Text>
            <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Fragile Items</Text>
            <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Temperature Sensitive</Text>
          </View>
        </PrimaryCard>

        {/* Driver Info */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <Text className="text-base font-semibold mb-3">Driver Information</Text>
          <View className="items-center mb-3">
            <View className="w-16 h-16 bg-blue-500 rounded-full justify-center items-center">
              <Text className="text-white font-bold text-xl">JD</Text>
            </View>
            <Text className="mt-2 font-semibold text-base">John Doe</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text className="ml-1 text-sm text-gray-700">(4.8) 287 reviews</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 text-center">
            Reliable and experienced driver with 5 years of safe delivery service. Specializes in fragile and temperature-controlled cargo.
          </Text>
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-10">
          <PrimaryButton
            title="View on Map"
            onPress={() => console.log('View on Map')}
            style={{ flex: 1, marginRight: 8, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          />
          <PrimaryButton
            title="Place Your Bid"
            onPress={() => router.push({
              pathname: '/pages/customer/PlaceBid',
              params: { 
                routeId: routeId,
                origin: origin,
                destination: destination
              }
            })}
            style={{ flex: 1, marginLeft: 8, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
