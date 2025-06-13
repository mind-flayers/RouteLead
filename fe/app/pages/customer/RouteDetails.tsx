import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RouteDetails() {
  return (
    <ScrollView className="flex-1 bg-white px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Route Details</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

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

      {/* Route Overview */}
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="text-base font-semibold mb-2">Route Overview</Text>
        <View className="mb-2">
          <Text className="text-gray-700 font-semibold">Origin</Text>
          <Text className="text-sm text-gray-600">Warehouse District, Northwood</Text>
        </View>
        <View className="mb-2">
          <Text className="text-gray-700 font-semibold">Destination</Text>
          <Text className="text-sm text-gray-600">Downtown Retail Park, City Center</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <View>
            <Text className="text-orange-600 font-bold text-lg">$120.00</Text>
            <Text className="text-xs text-gray-500">Estimated Payout</Text>
          </View>
          <View>
            <Text className="text-gray-700 font-semibold text-sm">1 hr 45 min</Text>
            <Text className="text-xs text-gray-500">45.2 km</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap mb-4">
        <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Heavy Cargo</Text>
        <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Fragile Items</Text>
        <Text className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">Temperature Sensitive</Text>
      </View>

      {/* Driver Info */}
      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <View className="items-center mb-2">
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
      </View>

      {/* Place Your Bid Button */}
      <TouchableOpacity
        className="bg-[#0D47A1] py-4 rounded-md mb-10"
        onPress={() => router.push('/pages/customer/PlaceBid')}
      >
        <Text className="text-white font-semibold text-center text-base">Place Your Bid</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
